

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
    processElement: function(url, engine, page, state, elemName, elemUrlAttr) {

    	var self = this;
    	var relPath = this.getRelativePath();
    	page.evaluate(
    		phantomFunc(processTagElements, [elemName, elemUrlAttr, relPath]),
	        function(err, res) {
	            if(err) {
	            	console.log('error changing urls to download... ', err);

	            	// in case of an error call the next processor
	            	self.next(url, engine, page, state, done);
	            }
	            else {
	            	console.log('processed ' + res.length + ' results');
	            	self.downloadFiles(url, res, engine, state, function() {  
	            		self.next(url, engine, page, state, done);
	            	});
	            }
	        });
    },

    // private method to download files and store them locally
    // param urls {UrlStruct[]}
    // param engine {Engine}
    // param downloadAssetFunc {Function(UrlStruct)}
    downloadFiles: function(baseUrl, urls, engine, state, done) {

        var downloads = 0;

	    function downloaCompleted(err, url) {
	    	if(err) console.log('download ' + url + ' completed with errors...', err);
	    	else console.log('download ' + url + ' completed with success!');
			if(--downloads == 0) done();
	    }

    	for (var i = 0, len = urls.length; i < 0; ++i) {
    		++ downloads;
    		var struct = urls[i];
    		this.downloadAsset(baseUrl, struct, engine, state, downloadCompleted);
    	}
    },

    // Abstract method that should be defined by each specific class
    getRelativePath: function() { /* must be defined on a subclass */ },

    // Abstract method that should be defined by each specific class
    // param urlStruct {UrlStruct}
    // param engine {Engine}
    // param downloadCompleted {Function(err, url)}
    downloadAsset: function(baseUrl, urlStruct, engine, state, downloaCompletedFunc) { /* must be defined on a subclass */ }
});





///////////////////////////////////////////////////////////////////////////////
// This code is sent to the browser...
// Function that is executed on the context of the browser
// JQuery script is already loaded
function processPageElementsOnBrowser(elementName, elemUrlAttr, localPath) {

	function newGuid() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
    },

	function generateName(url) {
		
		// add the current name with a GUID appended
		var urlParts = url.split('/'),
			fileName = urlParts[urlParts.length - 1];

		return newGuid() + fileName();
	}

	function generateUrl(path, name) {
		return path + name;
	}

	function urlStruct(url, name) {
		this.url = url;
		this.name = name;
	}

	return function() {
		var urls = [];
		var parsedUrls = {};

		// get all elements with the "elementName" on the page
		$(elementName).each(function() {
			if(parsedUrls[url]) return;
				
			var url = $(this).attr(elemUrlAttr);

			// generate a name for this element to download
			var name = generateName(url); 

			// replace the URL on the document
			var newUrl = generateUrl(localPath, name);
			$(this).attr(elemUrlAttr, newUrl);

			// create a urlStruct with the name
			var struct = new urlStruct(url, name);
			urls.push(struct);

			parsedUrls[url] = struct;
		});

		return urls;
	}();
}


// exports the processor
module.exports = elementDownloaderProcessor;








