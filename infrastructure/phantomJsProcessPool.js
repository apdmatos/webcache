var phantom       = require('node-phantom')               ,
    logger        = require('../logger')                  ,
    fifoContainer = require('./containers/fifoContainer') ,
    RSVP          = require('rsvp')                       ;

/**
 * A pool implementation that creates new phantom processes
 * @param  {int}             poolSize       
 */
function phantomJsProcessPool(maxPoolSize, timeout) {

    this.maxPoolSize                = maxPoolSize;
    this.timeut                     = timeout;
    this.poolSize                   = 0;

    this._phantomProcesses          = [];
    this._availablePhantomProcesses = [];
    this._blockedProcessed          = new fifoContainer();
}

phantomJsProcessPool.prototype = {

    /**
     * gets a phantom process to execute the request
     * @param  {Promise(pahntomPage)} executor The function that will receive the phantom page to run
     * @param  {int?}                  timeout  [description]
     * @return {Promise} when a phantom process is available the promise will be available to run
     */
    process: function(executor, timeout) {
        
        timeout = timeout || this.timeout;
        var deferred = RSVP.defer(),
            self      = this;        

        this._getPhantomProcess()
            .then(function(phantonProcess) {

                if(phantomProcess.exited) {
                    self.process(executor, timeout);
                }

                if(phantomProcess) {

                    self._runExecutor(executor, phantomProcess, deferred);
                } else {
                    
                    // there is no phantom process available. let's block until there is
                    // an available process to run this process
                    var waitingPromise = RSVP.defer();
                    self._blockedProcessed.push(waitingPromise);
                    waitingPromise.then(function(phantomProcess) {
                        // executes function with a phantom object in the pool
                        self._runExecutor(executor, phantomProcess, deferred);
                    });
                }
            });

        return deferred;
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
            var phantomProcess = this._phantomProcesses.exit();
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

    _runExecutor: function(executor, phantomProcess, completePromise) {
        // executes function with a phantom object in the pool
        executor(phantomProcess)
            .then(function() {
                // success
                completePromise.resolve();
            })
            .catch(function(error) {
                logger.error('executor completed with error.', error);
                completePromise.reject(error);
            })
            .finally(function() {

                // add the phantom process back to the queue
                logger.info('checking if there is an executor waiting for a phantom process');
                var blockedExecutor = self._getBlockedExecutor();
                if(blockedExecutor != null) {
                    logger.info('unblocking an executor, with the phantom process');
                    blockedExecutor.resolve(phantomProcess);
                } else {
                    if(phantomProcess.exited) {
                        logger.info('No blocked executors found, adding the phantom process back to the queue');
                        this._availablePhantomProcesses.push(phantomProcess);
                    }
                }
            });
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

            logger.info('No available phantom processed, but the pool has not reached the max size yet. Creating a phantom process...');

            phantom.create(function(err,ph) {
                if(err) {
                    logger.error('error creating a new phantom process: ', err);
                    //reject();
                    resolve(null);
                } else {
                    resolve(ph);

                    this._phantomProcesses.push(ph);
                    ph.on('error',function() {
                        logger.error('an error occurred on the phantom process... this process will exit');
                        ph.exit();
                        ph.exited = true;
                    });
                    ph.on('exit',function(code) {
                        logger.error('an error occurred on the phantom process... this process will exit');
                        ph.exited = true;
                    });
                }
            });
        });
    },

    _getBlockedExecutor: function() {
        return this._blockedProcessed.pop(); 
    }
};

module.exports = phantomJsProcessPool;