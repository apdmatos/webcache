
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


function parallelExecutor(processors) {


	this.processors = processors;

}

util.inherits(absoluteUriProcessor, baseProcessor);

utils.extend(absoluteUriProcessor.prototype, {

	process: function(url, engine, page, state, done) {
        console.log('parallel executor processor...');

        // base.process
        var self = this;
        state = baseProcessor.prototype.process.apply(this, arguments);


        // variable to count how many processors have completed
        var processorsDone = 0;
	    function downloadCompleted() {
	    	console.log('processor done... still waiting for: ' + processorsDone + ' processors');
			if(--processorsDone == 0) self.next(url, engine, page, state, done);
	    }

	    // execute processors in parallel, synhronizing the result
    	for (var i = 0, len = this.processors; i < len; ++i) {
    		++ processorsDone;
    		var processor = this.processors[i];

    		// call the processor
    		processor.process(url, engine, page, state, processorsDone);
    	}

	}

});



module.exports = parallelExecutor;