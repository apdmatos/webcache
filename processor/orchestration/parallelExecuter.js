
///////////////////////////
//
// this is a special processor that allows the execution of multiple processors at the same time
//	
//			  |----	p1 ----- |
// 		p0---- ---- p2 -----  ----- p4
//			  |----	p3 ----- | 
//


var baseProcessor = require('./processor');
var util = require('util');
var utils = require('./../util');


function parallelExecutor(nextProcessor, store, processors) {

    baseProcessor.apply(this, [baseProcessor, store]);
	this.processors = processors;

}

util.inherits(absoluteUriProcessor, baseProcessor);

utils.extend(absoluteUriProcessor.prototype, {

	process: function(url, engine, page, state, done) {
        console.log('parallel executor processor...');

        // base.process
        var self = this;
        state = baseProcessor.prototype.process.apply(this, arguments);

        var next = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
        
        // variable to count how many processors have completed
        var waitFn = utils.cumulatingCallbacks(next, this);

        // execute processors in parallel, synhronizing the result
        for (var i = 0, len = this.processors; i < len; ++i) {
            var fn = waitFn();
            var processor = this.processors[i];

            // call the processor
            processor.process(url, engine, page, state, fn);
        }

	}

});


module.exports = parallelExecutor;

