

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
    // param baseUrl {String} the base url
    // param urlStruct {UrlStruct}
    // param engine {Engine}
    // param state {processorData}
    // param downloadCompleted {Function(err, url)}
    downloadAsset: function(baseUrl, urlStruct, engine, state, downloaCompletedFunc) { 

    	var self = this;
    	engine.getAssetFile(baseUrl, urlStruct.url, 
    		function(data) { // success callback

    			// TODO: run regex processor
    			
    			// save file to disk
    			self.store.saveJs(data, state.storedata, function(err) {

    				// callback the downloadCompletedFunction
    				downloaCompletedFunc(err, urlStruct.url);	
    			});
    		}, 
    		function(error) {
    			// error callback
    			downloaCompletedFunc(error, urlStruct.url);	
    		}
    	);
    }



});




// exports the processor
module.exports = jsProcessor;










