
////////////////////////////
// porpose:
// 	 Downloads all the images on the page and stores them on a local 
// 	 folder changing the URL to a relative one


// Processor dependencies
var baseProcessor = require('./elementDownloaderProcessor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function imgProcessor() {
    // call base constructor
    baseProcessor.apply(this, arguments);

}


util.inherits(imgProcessor, baseProcessor);

utils.extend(imgProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('img processor...');
        state = baseProcessor.prototype.process.apply(this, arguments);
        this.processElement(url, engine, page, state, 'img', 'src');
    },

    // Abstract method that should be defined by each specific class
    getRelativePath: function() { 
    	return this.store.getImagesRelativePath();
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
    			// save file to disk
    			self.store.saveCss(data, state.storedata, function(err) {

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
module.exports = imgProcessor;




