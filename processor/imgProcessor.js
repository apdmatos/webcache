
////////////////////////////
// porpose:
// 	 Downloads all the images on the page and stores them on a local 
// 	 folder changing the URL to a relative one


// Processor dependencies
var processor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function imgProcessor() {
    // call base constructor
    processor.apply(this, arguments);

}


util.inherits(imgProcessor, processor);

utils.extend(imgProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('img processor...');
        var self = this;
        state = processor.prototype.process.apply(this, arguments);
        
        self.next(url, engine, page, state, done);
    }


});




// exports the processor
module.exports = imgProcessor;




