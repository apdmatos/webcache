

// Processor dependencies
var baseProcessor       = require('./processor')                                    ,
    posProcessorData    = require('../posProcessors/data/posProcessorData')         ,
    urlMod              = require('url')                                            ,
    util                = require('util')                                           ,
    utils               = require('./../util')                                      ,
    phantomFunc         = require('../node-phantom-extensions/parameterFunction')   ;

/**
 * @Constructor
 * Abstract class to download page assets (such as: img, css, script, ...)
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {PosProcessor} regexProcessor
 */
function elementDownloaderProcessor(nextProcessor, store, posProcessor) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);
    this.posProcessor = posProcessor;
}


util.inherits(elementDownloaderProcessor, baseProcessor);
utils.extend(elementDownloaderProcessor.prototype, {

    /**
     * @protected
     * protected method that is called from each specific class
     * @param  {String}         url   
     * @param  {Engine}         engine
     * @param  {PahntomPage}    page 
     * @param  {ProcessorData}  state
     * @param  {String}         elemName
     * @param  {String}         elemUrlAttr
     * @param  {Function}       done
     */
    processElement: function(url, engine, page, state, elemName, elemUrlAttr, done) {

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

                    // in case of an error call the next baseProcessor
                    self.next(url, engine, page, state, done);
                }
                else {
                    
                    self.downloadFiles(url, res, engine, state, function() {  
                        self.next(url, engine, page, state, done);
                    });
                }
            });
    },

    /**
     * private method to download files and store them locally
     * @param  {String}         baseUrl 
     * @param  {UrlStruct[]}    urls    
     * @param  {Engine}         engine  
     * @param  {ProcessorData}  state
     * @param  {Function}       done
     */
    downloadFiles: function(baseUrl, urls, engine, state, done) {


        var waitFn = utils.waitForCallbacks(done, this);
        for (var i = 0, len = urls.length; i < len; ++i) {
            var fn = waitFn();
            var struct = urls[i];
            this.downloadAsset(baseUrl, struct, engine, state, fn);
        }
    },

    /**
     * private method to download a specific asset file
     * @param  {String}         baseUrl
     * @param  {UrlStruct[]}    urlStruct
     * @param  {Engine}         engine
     * @param  {ProcessorData}  state
     * @param  {Function}       downloaCompletedFunc
     */
    downloadAsset: function(baseUrl, urlStruct, engine, state, downloaCompletedFunc) { 
        var self = this;
        engine.getAssetFile(baseUrl, urlStruct.url, self.getEncoding(),
            function(data) { // success callback

                // run pre processors
                if(self.posProcessor) {
                    
                    var absoluteUrl = urlMod.resolve(baseUrl, urlStruct.url);
                    var posProcessorData = self.getPosProcessorsData(state, absoluteUrl, engine);

                    // run pre processor
                    self.posProcessor.process(data, posProcessorData, function(fileData) {
                        // save file to disk
                        self.saveFile(fileData, state, urlStruct, function(err) {
                            if(err) {
                                console.log('error writing the file ' + urlStruct.name + ' with error ' + err);
                            }
                            downloaCompletedFunc(err, urlStruct.url);   
                        })
                    });

                }else {
                    // save file to disk
                    self.saveFile(data, state, urlStruct, function(err) {
                        if(err) {
                            console.log('error writing the file ' + urlStruct.name + ' with error ' + err);
                        }
                        downloaCompletedFunc(err, urlStruct.url);   
                    });
                }
            }, 
            function(error) {
                // error callback
                downloaCompletedFunc(error, urlStruct.url);    
            }
        );
    },

    /**
     * Abstract method that should be defined by each specific class
     * @return {String} The relative path to set on URL's
     */
    getRelativePath: function() { /* must be defined on a subclass */ },

    /**
     * returns the file encoding
     * @return {String} the encoding
     */
    getEncoding: function() { /* must be defined on a subclass */ },

    /**
     * Abstract method that should be defined by each specific class
     * @param  {String|Stream}  data      downloaded from the internet
     * @param  {ProcessorData}  state     the state to save the file
     * @param  {UrlStruct[]}    urlStruct containing the file name and the file path
     * @param  {Function}       doneFunc  Function to be executed
     */
    saveFile: function(data, state, urlStruct, doneFunc) { /* must be defined on a subclass */ },

    /**
     * Checks if this processor can process the given URL path
     * @param  {String} url
     * @param  {[ProcessorData]} state
     * @return {Boolean} - returns true if it can process, false otherwise
     */
    apply: function(url, state) { /* must be defined on a subclass */ },

    /**
     * Hook method to return posProcessor data
     * @param  {ProcessorData} state   
     * @param  {String} baseUrl 
     * @param  {Engine} engine  
     * @return {PosProcessorData}  The pos processor data to call posProcessor
     */
    getPosProcessorsData: function(state, baseUrl, engine) { /* must be defined on a subclass */ }
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
            fileName = urlParts[urlParts.length - 1].split('?')[0];

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


// exports the baseProcessor
module.exports = elementDownloaderProcessor;








