
var phantom 		= require('node-phantom')					,
	logger 			= require('../logger')						,
	fifoContainer 	= require('./containers/fifoContainer')		,
	RSVP 			= require('rsvp')							;


/**
 * A pool implementation that creates new phantom processes
 * @param  {int} 			poolSize 	  
 */
function phantomJsProcessPool(maxPoolSize, timeout) {

	this.maxPoolSize 			= maxPoolSize;
	this.timeut 				= timeout;
	this.poolSize 				= 0;

	this._phantomProcesses 		= [];
	this._blockedProcessed 		= new fifoContainer();
}


phantomJsProcessPool.prototype = {

	process: function(executor, timeout) {
		
		timeout = timeout || this.timeout;
		var deferred = RSVP.defer(),
			self 	 = this;		

		this._getPhantomProcess()
			.then(function(phantonProcess) {
				if(phantomProcess) {

					// executes function with a phantom object in the pool
					executor(page)
						.then(function() {

							deferred.resolve();
						}, function(error) {

						})
						.catch(function(error) {

						});
					
				} else {
					
					// there is no phantom process available. let's block until there is
					// an available process to run this process
					var waitingPromise = RSVP.defer();
					self._blockedProcessed.push(waitingPromise);
					waitingPromise.then(function() {

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
	 */
	destroy: function() {
		// TODO: to be implemented
	},

	_getPhantomProcess: function() {

		var self = this;
		return new RSVP.Promise(function(resolve, reject) {
			if(self._phantomProcesses.length > 0) {
				
				logger.info('getting phantom process to process a webpage');

				var phantomProcess = self._phantomProcesses.pop();
				resolve(phantomProcess);
				return;
			}

			// no available phantom processes. Check if we can create a new one
			if(self.poolSize == self.maxPoolSize) {
				logger.info('all phantom processes are taken');
				resolve(null);
				return;
			}

			logger.info('The pool has not reached the max size yet. Creating a phantom process...');

			phantom.create(function(err,ph) {
				resolve(ph);
			});
		});
	}
};

module.exports = phantomJsProcessPool;