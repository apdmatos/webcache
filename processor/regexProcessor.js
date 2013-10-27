

// Processor dependencies
var baseProcessor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');



// processor constructor
function regexProcessor() {
    // call base constructor
    baseProcessor.apply(this, arguments);

}


util.inherits(regexProcessor, baseProcessor);

utils.extend(regexProcessor.prototype, {

    process: function(url, engine, page, state, done) {

    	// TODO: Implement me...
        console.log('regex processor...');
        var self = this;
        state = baseProcessor.prototype.process.apply(this, arguments);
        
        self.next(url, engine, page, state, done);
    }


});




// exports the processor
module.exports = regexProcessor;










