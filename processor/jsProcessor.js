

// Processor dependencies
var baseProcessor = require('./elementDownloaderProcessor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function jsProcessor() {
    // call base constructor
    baseProcessor.apply(this, arguments);

}


util.inherits(jsProcessor, baseProcessor);

utils.extend(jsProcessor.prototype, {


    process: function(url, engine, page, state, done) {

        console.log('js processor...');
        state = baseProcessor.prototype.process.apply(this, arguments);
        this.processElement(url, engine, page, state, 'script', 'src');
    },

    // Abstract method that should be defined by each specific class
    getRelativePath: function() { 
    	return this.store.getJSRelativePath();
    },

    // Abstract method that should be defined by each specific class
    // param data {Buffer} data downloaded from the internet
    // param state {ProcessorData}
    // param doneFunc {Function(err)}
    saveFile: function(data, state, doneFunc) { 
    	this.store.saveJs(data, state.storedata, doneFunc);
    }


});




// exports the processor
module.exports = jsProcessor;










