var phantom       = require('../node-phantom-extensions/phantomProcessExtensions')     ,
    logger        = require('../logger')                                               ,
    fifoContainer = require('./containers/fifo')                                       ,
    RSVP          = require('rsvp')                                                    ,
    utils         = require('../util')                                                 ;

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

        function processUrl() {

            self._getPhantomProcess()
                .then(function(phantomProcess) {

                    if(phantomProcess && phantomProcess.exited) {
                        processUrl();
                        return;
                    }

                    if(phantomProcess) {

                        self._runExecutor(url, timeout, executor, phantomProcess, deferred);
                    } else {
                        
                        logger.info('process for url ' + url + ' is being blocked waiting for a phantom process');

                        // there is no phantom process available. let's block until there is
                        // an available process to run this process
                        var waitingPromise = RSVP.defer();
                        self._blockedProcessed.push(waitingPromise);
                        waitingPromise.promise.then(function() {

                            logger.info('unblocked process for url: ', url);
                            processUrl();
                        });
                    }
                })
                .catch(function(err) {
                    logger.error('an error occurred processing the executer for url: ' + url);
                    utils.printError(logger, err);
                    deferred.reject(err);
                });
        }

        processUrl();

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
    destroy: function() {
        logger.info('destroying phantom processes...');
        logger.info('availablePhantomProcesses: ' + this._availablePhantomProcesses.length);
        logger.info('phantomProcesses: ' + this._phantomProcesses.length);
        logger.info('poolSize: ' + this.poolSize);
        logger.info('maxPoolSize: ' + this.maxPoolSize);

        // clean up phantom pools
        for (var i = 0, len = this._phantomProcesses.length; i < len; ++i) {
            logger.info('exiting phantom process with index ' + i);
            this._phantomProcesses[i].exit();
        }
        this._phantomProcesses          = [];
        this._availablePhantomProcesses = [];
    
        // clean up blocked processes
        this._blockedProcessed          = new fifoContainer();
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
            completePromise.reject('could not open page ' + url);

            // unblock a possible blocked executor...
            self.unblockExecutor();
            return;
        }

        function openPageExecutor() {

            logger.info('trying to open page for url ' + url + ' retry number ' + retries);
            phantomProcess.openPage(url, timeout, this.maxRetries)
                .then(
                    function(page) {

                        logger.info('page successfully opened for url ' + url);

                        // executes function with a phantom object in the pool
                        executor(page, url)
                            .then(function() {
                                logger.info('executor for url ' + url + ' has successfully completed');
                                completePromise.resolve();
                            })
                            .catch(function(error) {
                                logger.error('executor completed with error for url ' + url, error);
                                if(error.stack) logger.error(error.stack);
                                completePromise.reject(error);
                            })
                            .finally(function() {
                                // close the page
                                page.close();

                                // add the phantom process back to the queue
                                if(!phantomProcess.exited) {
                                    self._availablePhantomProcesses.push(phantomProcess);
                                }

                                // notify another process to start
                                self.unblockExecutor();
                            });
                    }
                    , function(reason) {
                        // cannot open page url: 
                        logger.error('error opening page ', url);

                        // discard phantom process
                        phantomProcess.exit();
                        self._runExecutor(url, timeout, executor, null, completePromise, ++retries);
                    });
        }


        if(phantomProcess == null) {

            logger.info('phantom process is null... creating a new one... for url ' + url);
            this._createPhantomProcess()
                .then(
                    function(ph) {
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
        
        logger.info('-------------------------------------------------------------------');
        logger.info('availablePhantomProcesses: ' + self._availablePhantomProcesses.length);
        logger.info('phantomProcesses: ' + self._phantomProcesses.length);
        logger.info('poolSize: ' + self.poolSize);
        logger.info('maxPoolSize: ' + self.maxPoolSize);

        if(self._availablePhantomProcesses.length > 0) {
            
            logger.info('getting phantom process to process a webpage');

            var phantomProcess = self._availablePhantomProcesses.pop();
            return RSVP.Promise.resolve(phantomProcess);
        }

        // no available phantom processes. Check if we can create a new one
        if(self.poolSize == self.maxPoolSize) {
            logger.info('all phantom processes are taken');
            return RSVP.Promise.resolve(null);
        }

        logger.info('No available phantom processes, but the pool has not reached the max size yet. Creating a phantom process...');
        ++self.poolSize;

        return self._createPhantomProcess()
            .catch(function(err) {
                --self.poolSize;

                // unblock another process that could be blocked...
                self.unblockExecutor();

                return RSVP.Promise.reject(err);
            });
    },

    _createPhantomProcess: function() {
        var self = this;
        logger.info('trying to create a phantom process....');
        return phantom.createPhantomProcess(self.timeout, self.maxRetries)
            .then(function(ph) {
                logger.info('phantomProcess successfully created');

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

                return ph;
            }).catch(function(err) {
                logger.error('error creating a new phantom process: ', reason);
                return RSVP.Promise.reject(err);
            });
    },

    unblockExecutor: function() {
        logger.info('checking if there is an executor waiting for a phantom process');
        var executor = this._blockedProcessed.pop(); 
        if(executor) {
            logger.info('unblocking an executor...');
            executor.resolve();
        } else {
            logger.info('no executors found to unblock...');
        }
    }
};

module.exports = phantomJsProcessPool;

