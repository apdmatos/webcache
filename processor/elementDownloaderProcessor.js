

//////////////////////
//
// Abstract class to download page elements, sush as: img, css, script, ...
//


// Processor dependencies
var processor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction');



// processor constructor
function elementDownloaderProcessor() {
    // call base constructor
    processor.apply(this, arguments);

}


util.inherits(elementDownloaderProcessor, processor);

utils.extend(elementDownloaderProcessor.prototype, {

    // protected method that is called from each specific class
    processElement: function(url, engine, page, state, elemName, elemUrlAttr, format, done) {

    	var self = this;
    	var relPath = this.getRelativePath();
    	page.evaluate(
    		phantomFunc(processPageElementsOnBrowser, [elemName, elemUrlAttr, relPath]),
	        function(err, res) {

                var elems = res && res.length ? res.length : 0;
                console.log('processed ' + elems + ' results');

	            if(err || !res || res.length == 0) {

                    if(err) {
                        console.log('error changing urls to download... ', err);
                    }

	            	// in case of an error call the next processor
	            	self.next(url, engine, page, state, done);
	            }
	            else {
                    
	            	self.downloadFiles(url, res, engine, state, format, function() {  
	            		self.next(url, engine, page, state, done);
	            	});
	            }
	        });
    },

    // private method to download files and store them locally
    // param urls {UrlStruct[]}
    // param engine {Engine}
    // param downloadAssetFunc {Function(UrlStruct)}
    downloadFiles: function(baseUrl, urls, engine, state, format, done) {

        var downloads = 0;

	    function downloadCompleted(err, url) {
	    	if(err) console.log('download ' + url + ' completed with errors...', err);
	    	else console.log('download ' + url + ' completed with success!');
			if(--downloads == 0) done();
	    }

    	for (var i = 0, len = urls.length; i < len; ++i) {
    		++ downloads;
    		var struct = urls[i];
    		this.downloadAsset(baseUrl, struct, engine, state, format, downloadCompleted);
    	}
    },

    // private method to download a specific asset file
    // param urlStruct {UrlStruct}
    // param engine {Engine}
    // param downloadCompleted {Function(err, url)}
    downloadAsset: function(baseUrl, urlStruct, engine, state, format, downloaCompletedFunc) { 
		var self = this;
    	engine.getAssetFile(baseUrl, urlStruct.url, format,
    		function(data) { // success callback

    			// TODO: run pre processors

    			// save file to disk
    			self.saveFile(data, state, urlStruct, function(err) {
    				downloaCompletedFunc(err, urlStruct.url);	
    			})
    		}, 
    		function(error) {
    			// error callback
    			downloaCompletedFunc(error, urlStruct.url);	
    		}
    	);
    },

    // Abstract method that should be defined by each specific class
    getRelativePath: function() { /* must be defined on a subclass */ },

    // Abstract method that should be defined by each specific class
    // param data {Buffer} data downloaded from the internet
    // param state {ProcessorData}
    // param urlStruct {UrlStruct} containing the file name and the file path
    // param doneFunc {Function(err)}
    saveFile: function(data, state, urlStruct, doneFunc) { /* must be defined on a subclass */ }
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
    }

	function generateName(url) {
		
		// add the current name with a GUID appended
		var urlParts = url.split('/'),
			fileName = urlParts[urlParts.length - 1];

		return newGuid() + fileName;
	}

	function generateUrl(path, name) {
		return path + '/' + name;
	}

	function urlStruct(url, localUrl, name) {
		this.url = url;
        this.localUrl = localUrl;
		this.name = name;
	}

	return function() {
		var urls = [];
		var parsedUrls = {};

		// get all elements with the "elementName" on the page
		$(elementName).each(function() {
			
			var url = $(this).attr(elemUrlAttr);
            if(!url) return;

            var newUrl;

            if(parsedUrls[url]) {

                // get the url to be setted on elements that reuse it
                newUrl = parsedUrls[url].localUrl;

            } else {

                // generate a name for this element to download
                var name = generateName(url);     

                // replace the URL on the document
                newUrl = generateUrl(localPath, name);

                // create a urlStruct with the name
                var struct = new urlStruct(url, newUrl, name);
                urls.push(struct);

                parsedUrls[url] = struct;

            }

            // replace the URL on the document
            $(this).attr(elemUrlAttr, newUrl);
		});

		return urls;
	}();
}


// exports the processor
module.exports = elementDownloaderProcessor;








