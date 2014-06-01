var phantom       = require('node-phantom')               ,
    logger        = require('../logger')                  ,
    fifoContainer = require('../containers/fifo')         ,
    RSVP          = require('rsvp')                       ,
    utils         = require('../util')                    ;


// Constants
var defaultPageSize = {width: 1024, height: 800};


/**
 * A pool implementation that creates new phantom processes
 * @param  {int}             poolSize       
 */
function phantomJsProcessPool(maxPoolSize, maxRetries, timeout) {

    this.maxPoolSize                = maxPoolSize;
    this.maxRetries                 = maxRetries;
    this.timeut                     = timeout;
    this.poolSize                   = 0;

    this._phantomProcesses          = [];
    this._availablePhantomProcesses = [];
    this._blockedProcessed          = new fifoContainer();
}

phantomJsProcessPool.prototype = {

    /**
     * gets a phantom process to execute the request
     * @param  {string} url The page url to open
     * @param  {Promise(phantomPage)} executor The function that will receive the phantom page to run
     * @param  {int?} timeout  The timeout to wait to process the page
     * @return {Promise} when a phantom process is available the promise will be available to run
     */
    process: function(url, executor, timeout) {
        
        timeout      = timeout || this.timeout;
        var deferred = RSVP.defer(),
            self     = this;        

        this._getPhantomProcess()
            .then(function(phantomProcess) {
                if(phantomProcess.exited) {
                    self.process(executor, timeout);
                }

                if(phantomProcess) {

                    self._runExecutor(url, timeout, executor, phantomProcess, deferred);
                } else {
                    
                    // there is no phantom process available. let's block until there is
                    // an available process to run this process
                    var waitingPromise = RSVP.defer();
                    self._blockedProcessed.push(waitingPromise);
                    waitingPromise.then(function(phantomProcess) {
                        // executes function with a phantom object in the pool
                        self._runExecutor(url, timeout, executor, phantomProcess, deferred);
                    });
                }
            })
            .catch(function(err) {
                logger.error('an error occurred processing the executer for url: ' + url + ' with error: ' + err);
                deferred.reject(err);
            });

        return deferred.promise;
    },

    /**
     * checks is there are available phantom processes on the pool
     * @return {boolean} returns true if there is, false if not
     */
    canProcess: function() {
        return !!(self.poolSize == self.maxPoolSize);
    },

    /**
     * Disposes all the created phantom processes
     * @param  {boolean} force when true, this parameter will destroy even the running processes
     */
    destroy: function(force) {

        // clean up phantom pools
        for (var i = 0, len = this._phantomProcesses.length; i < len; ++i) {
            var phantomProcess = this._phantomProcesses[i].exit();
        }
        this._phantomProcesses          = [];
        this._availablePhantomProcesses = [];
    
        // clean up blocked processes
        this._blockedProcessed          = new fifoContainer();

        // todo: clean up in progress processes
    },

    _removePhantomProcess: function(phantomProcess) {
        
        for(var i = this._availablePhantomProcesses.length; i--;) {
            if(this._availablePhantomProcesses[i] === phantomProcess) {
                this._availablePhantomProcesses.splice(i, 1);
            }
        }

        for(var i = this._phantomProcesses.length; i--;) {
            if(this._phantomProcesses[i] === phantomProcess) {
                this._phantomProcesses.splice(i, 1);
                --this.poolSize;
            }
        }
    },

    _runExecutor: function(url, timeout, executor, phantomProcess, completePromise, retries) {

        var self = this;
        retries = retries || 0;
        if(retries > this.maxRetries) {
            logger.error('could not open page ', url);
            completePromise.reject(error);
            return;
        }

        function openPageExecutor() {
            self._createPhantomPage(url, timeout, phantomProcess, function(phantomPage) {
                // executes function with a phantom object in the pool
                executor(phantomPage)
                    .then(function() {
                        // success
                        completePromise.resolve();
                    })
                    .catch(function(error) {
                        logger.error('executor completed with error.', error);
                        completePromise.reject(error);
                    })
                    .finally(function() {

                        // close the page
                        phantomPage.close();

                        // add the phantom process back to the queue
                        logger.info('checking if there is an executor waiting for a phantom process');
                        var blockedExecutor = self._getBlockedExecutor();
                        if(blockedExecutor != null) {
                            logger.info('unblocking an executor, with the phantom process');
                            blockedExecutor.resolve(phantomProcess);
                        } else {
                            if(phantomProcess.exited) {
                                logger.info('No blocked executors found, adding the phantom process back to the queue');
                                self._availablePhantomProcesses.push(phantomProcess);
                            }
                        }
                    });
            }, 
            function() { 
                // cannot open page url: 
                logger.error('error opening page ', url);

                // discard phantom process
                phantomProcess.exit();
                self._runExecutor(url, timeout, executor, null, completePromise, ++retries);
            });
        }


        if(phantomProcess == null) {

            this._createPhantomProcess(function(ph) {
                phantomProcess = ph;
                openPageExecutor();
            }, function() {
                // error
                self._runExecutor(url, timeout, executor, null, completePromise, ++retries);
            });

        } else {

            openPageExecutor();
        }
    },

    _getPhantomProcess: function() {

        var self = this;
        return new RSVP.Promise(function(resolve, reject) {
            if(self._availablePhantomProcesses.length > 0) {
                
                logger.info('getting phantom process to process a webpage');

                var phantomProcess = self._availablePhantomProcesses.pop();
                resolve(phantomProcess);
                return;
            }

            // no available phantom processes. Check if we can create a new one
            if(self.poolSize == self.maxPoolSize) {
                logger.info('all phantom processes are taken');
                resolve(null);
                return;
            }

            logger.info('No available phantom processes, but the pool has not reached the max size yet. Creating a phantom process...');
            ++self.poolSize;

            var retries = 0;
            function createPhantomProcess() {
                if(retries > self.maxRetries){
                    --self.poolSize;
                    reject();
                }

                self._createPhantomProcess(resolve, function() {
                    ++ retries;
                    createPhantomProcess();
                });    
            }

            createPhantomProcess();
        });
    },

    _createPhantomProcess: function(success, error) {
        var self = this;
        phantom.create(function(err,ph) {
            if(err) {
                logger.error('error creating a new phantom process: ', err);
                error();
            } else {
                logger.info('phantomProcess successfully created');
                success(ph);

                self._phantomProcesses.push(ph);
                ph.on('error',function() {
                    logger.error('an error occurred on the phantom process... this process will exit');
                    ph.exit();
                    ph.exited = true;
                    self._removePhantomProcess(ph);
                });
                ph.on('exit',function(code) {
                    logger.warn('phantom process exited');
                    ph.exited = true;
                    self._removePhantomProcess(ph);
                });
            }
        });
    },

    _createPhantomPage: function(url, timeout, phantomProcess, success, error) {
        logger.info('creating phantom page for ', url);
        phantomProcess.createPage(
            function(err, page) {
                if(err) {
                    logger.error('error creating the page ', url);
                    error(err);
                    return;
                }
                page.set('viewportSize', defaultPageSize);
                page.open(url, 
                    function(err,status) {
                        if(err) {
                            logger.error('error opening the page ', url);
                            error(err);
                            return;
                        }
                        logger.info("page opened ", url);
                        success(page);
                    });
            });
    },

    _getBlockedExecutor: function() {
        return this._blockedProcessed.pop(); 
    }
};

module.exports = phantomJsProcessPool;

