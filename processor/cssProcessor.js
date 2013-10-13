

// Processor dependencies
var baseProcessor = require('./elementDownloaderProcessor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function cssProcessor() {
    // call base constructor
    baseProcessor.apply(this, arguments);

}


util.inherits(cssProcessor, baseProcessor);

utils.extend(cssProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('css processor...');
        state = baseProcessor.prototype.process.apply(this, arguments);
        this.processElement(url, engine, page, state, 'link', 'href');
    },

    // Abstract method that should be defined by each specific class
    getRelativePath: function() { 
    	return this.store.getCSSRelativePath();
    },

    // Abstract method that should be defined by each specific class
    // param data {Buffer} data downloaded from the internet
    // param state {ProcessorData}
    // param doneFunc {Function(err)}
    saveFile: function(data, state, doneFunc) { 
    	this.store.saveCss(data, state.storedata, doneFunc);
    }
});




// exports the processor
module.exports = cssProcessor;






