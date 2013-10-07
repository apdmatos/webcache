

// Processor dependencies
var processor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function jsProcessor() {
    // call base constructor
    processor.apply(this, arguments);

}


util.inherits(jsProcessor, processor);

utils.extend(jsProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('js processor...');
        var self = this;
        self.next(url, engine, page, state, done);
    }


});




// exports the processor
module.exports = jsProcessor;










