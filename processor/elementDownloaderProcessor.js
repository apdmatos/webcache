

//////////////////////
//
// Abstract class to download page elements, sush as: img, css, script, ...
//


// Processor dependencies
var processor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function elementDownloaderProcessor() {
    // call base constructor
    processor.apply(this, arguments);

}


util.inherits(elementDownloaderProcessor, processor);

utils.extend(elementDownloaderProcessor.prototype, {

    process: function(url, engine, page, state, done) {
        console.log('element downloader processor...');
        return processor.prototype.process.apply(this, arguments);
    },

    // protected method that is called from each specific class
    processElement: function(url, engine, page, state, downloadFunc, elemName) {

    	var self = this;
    	page.evaluate(
	        function() {
	        	// get all elements with the  elemName from the page
	        },
	        function(err, res) {
	            if(err) console.log('error including jquery... ', err);
	            else console.log('tag: ' + res.tag + ' length: ' + res.length);

	            if(--evaluates == 0) self.next(url, engine, page, state, done);
	        });

    	//engine.getAssetFile();
    	//: function(baseUrl, relativeUrl, callback, errorCallback) {

    },

    // private method to download files and store them locally
    // param urls {UrlStruct[]}
    downloadFiles: function(urls) {

    },

    // Abstract method that should be defined by each specific class
    getFilePath: function() { /* must be defined on a subclass */ }


});





///////////////////////////////////////////////////////////////////////////////
// This code is sent to the browser...
// Function that is executed on the context of the browser
// JQuery script is already loaded
function processPageElementsOnBrowser(elementName, elemUrlAttr, localPath) {

	function generateUrl(path, name) {

	}

	function urlStruct(url, name) {
		this.url = url;
		this.name = name;
	}

	return function() {
		var urls = [];
		// get all elements with the "elementName" on the page
		$(elementName).each(function() {
			var url = $(this).attr(elemUrlAttr);

			// TODO: generate a name
			// generate a name for this element to download
			var name = ""; 

			// replace the URL on the document
			var newUrl = generateUrl(localPath, name);
			$(this).attr(elemUrlAttr, newUrl);

			// create a urlStruct with the name
			var struct = new urlStruct(url, name);
			urls.push(struct);
		});

		return urls;
	}();
}


// exports the processor
module.exports = elementDownloaderProcessor;








