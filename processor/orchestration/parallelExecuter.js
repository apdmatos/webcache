
var baseProcessor = require('../processor') ,
    util = require('util')                  ,
    utils = require('../../util')           ;


/**
 * this is a special processor that allows the execution of multiple processors at the same time
 * 
 *            |---- p1 ----- |
 *      p0---- ---- p2 -----  ----- p4
 *            |---- p3 ----- | 
 *            
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {[Processor]} processors The processors to be executed on parallel
 */
function parallelExecutor(nextProcessor, store, processors) {

    baseProcessor.apply(this, [nextProcessor, store]);
	this.processors = processors;

}
util.inherits(parallelExecutor, baseProcessor);

utils.extend(parallelExecutor.prototype, {

    /**
     * Process the document content
     * @param  {[String]}           url
     * @param  {[Engine]}           engine
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @param  {Function}           done
     * @return {[ProcessorData]} if the state parameter is null, creates a new one
     */
	process: function(url, engine, page, state, done) {
        console.log('parallel executor processor...');

        // base.process
        var self = this;
        state = baseProcessor.prototype.process.apply(this, arguments);

        var next = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
        
        // variable to count how many processors have completed
        var waitFn = utils.waitForCallbacks(next, this);

        // execute processors in parallel, synhronizing the result
        for (var i = 0, len = this.processors.length; i < len; ++i) {
            var fn = waitFn();
            var processor = this.processors[i];

            // call the processor
            processor.process(url, engine, page, state, fn);
        }

	}

});


module.exports = parallelExecutor;

