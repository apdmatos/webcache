

// Processor dependencies
var processor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function cssProcessor() {
    // call base constructor
    processor.apply(this, arguments);

}


util.inherits(cssProcessor, processor);

utils.extend(cssProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('css processor...');
        var self = this;
        self.next(url, engine, page, state, done);
    }


});




// exports the processor
module.exports = cssProcessor;






