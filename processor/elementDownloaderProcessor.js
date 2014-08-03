var baseProcessor       = require('./processor')                                    ,
    posProcessorData    = require('./posProcessors/data/posProcessorData')          ,
    urlMod              = require('url')                                            ,
    util                = require('util')                                           ,
    utils               = require('./../util')                                      ,
    phantomFunc         = require('../node-phantom-extensions/parameterFunction')   ,
    RSVP                = require('rsvp')                                           ,
    _                   = require('underscore')                                     ,
    logger              = require('../logger')                                      ;

/**
 * @Constructor
 * Abstract class to download page assets (such as: img, css, script, ...)
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {[WebAssetsClient]} webAssetsClient
 * @param  {PosProcessor} regexProcessor
 * @param  {bool} continueWhenErrors
 */
function elementDownloaderProcessor(nextProcessor, store, webAssetsClient, posProcessor, continueWhenErrors) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

    this.webAssetsClient = webAssetsClient;
    this.posProcessor = posProcessor;
    this.continueWhenErrors = continueWhenErrors;
}

util.inherits(elementDownloaderProcessor, baseProcessor);
utils.extend(elementDownloaderProcessor.prototype, {

    /**
     * @protected
     * protected method that is called from each specific class
     * @param  {PahntomPage}    page 
     * @param  {ProcessorData}  state
     * @param  {String}         elemName
     * @param  {String}         elemUrlAttr
     * returns {Promise}
     */
    processElement: function(page, state, elemName, elemUrlAttr) {

        var self = this;
        var relPath = this.getRelativePath();

        page.evaluate(
            phantomFunc(processPageElementsOnBrowser, [elemName, elemUrlAttr, relPath])
        )
        .then(
            function(res) {
                var elems = res && res.length ? res.length : 0;
                logger.info('processed ' + elems + ' results for page ' + state.pageUrl);

                if(res && res.length > 0) {
                    logger.info('donwloading ' + res.length + ' assets');
                    return self.downloadFiles(res, state);
                }
            }
            // error
            , function(err) {
                logger.error('error finding ' + elemName + ' on page ' + state.pageUrl + ' error: ' + err);
                return RSVP.Promise.reject(err);
            })
        .then(function() {
            return self.next(page, state)
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
    downloadFiles: function(urls, state) {

        var self = this;
        var promises = [];

        for (var i = 0, len = urls.length; i < len; ++i) {

            var struct = urls[i];
            var promise = this.downloadAsset(state.pageUrl, struct, engine, state, fn);

            promises.push(promise);
        }

        return RSVP.allSettled(promises)
            .then(function(result) {

                if(!self.continueWhenErrors) {

                    // check for erros downloading any asset...
                    var rejected = _.where(results, { state: 'rejected' });
                    if(rejected.length > 0) {
                        var mappedErros = _.map(rejected, function(num, key){ return rejected[key].reason; });
                        return RSVP.Promise.reject(mappedErros);
                    }
                }

                return RSVP.Promise.resolve();
            });
    },

    /**
     * private method to download a specific asset file
     * @param  {String}         baseUrl
     * @param  {UrlStruct}      urlStruct
     * returns {Promise}
     */
    downloadAsset: function(baseUrl, urlStruct) { 
        var self = this;
        return self.webAssetsClient.getAssetFile(baseUrl, urlStruct.url, self.getEncoding())
            .then(function(data) {
                // run pre processors
                if(self.posProcessor) {
                    
                    var absoluteUrl = urlMod.resolve(baseUrl, urlStruct.url);
                    var posProcessorData = self.getPosProcessorsData(state);

                    // run pre processor
                    return self.posProcessor.process(data, posProcessorData);
                }

                return data;
            })
            .then(function(fileData) {
                // save file to disk
                return self.saveFile(fileData, state, urlStruct);
            });
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
     * @param  {UrlStruct}    urlStruct containing the file name and the file path
     * @returns {Promise}
     */    
    saveFile: function(data, state, urlStruct) { /* must be defined on a subclass */ },

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
     * @return {PosProcessorData}  The pos processor data to call posProcessor
     */
    getPosProcessorsData: function(state) { /* must be defined on a subclass */ }
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