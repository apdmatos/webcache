

// Processor dependencies
var baseProcessor = require('./elementDownloaderProcessor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');



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
        this.processElement(url, engine, page, state, 'script', 'src', 'utf8', done);
    },

    // Abstract method that should be defined by each specific class
    getRelativePath: function() { 
    	return this.store.getJSRelativePath();
    },

    // Abstract method that should be defined by each specific class
    // param data {Buffer} data downloaded from the internet
    // param state {ProcessorData}
    // param urlStruct {UrlStruct} containing the file name and the file path
    // param doneFunc {Function(err)}
    saveFile: function(data, state, urlStruct, doneFunc) { 
    	this.store.saveJs(data, state.storedata, urlStruct.name, doneFunc);
    },

    /**
     * Checks if this processor can process the given URL path
     * @param  {String} url
     * @param  {[ProcessorData]}    state
     * @return {Boolean} - returns true if it can process, false otherwise
     */
    apply: function(url, state) {  }

});




// exports the processor
module.exports = jsProcessor;










