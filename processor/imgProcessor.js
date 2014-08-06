var baseProcessor   = require('./elementDownloaderProcessor')   ,
    urlMod          = require('url')                            ,
    util            = require('util')                           ,
    utils           = require('./../util')                      ,
    logger          = require('./../logger')                    ;

/**
 * @constructor
 * Downloads all the images on the page and stores them on a local 
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {[WebAssetsClient]} webAssetsClient
 */
function imgProcessor(nextProcessor, store, webAssetsClient) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store, webAssetsClient, null, true]);

}

util.inherits(imgProcessor, baseProcessor);
utils.extend(imgProcessor.prototype, {

    /**
     * Process the document content
     * @param  {[String]}           url
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return {Promise[ProcessorData]}
     */
    process: function(page, state) {
        logger.info('img processor for url ', state.pageUrl);

        baseProcessor.prototype.process.apply(this, arguments);
        return this.processElement(page, state, 'img', 'src');
    },

    /**
     * Abstract method that should be defined by each specific class
     * @return {String} The relative path to set on URL's
     */
    getRelativePath: function() { 
        return this.store.getImagesRelativePath();
    },

    /**
     * returns the file encoding
     * @return {String} the encoding
     */
    getEncoding: function() { 
        return 'binary';
    },    

    /**
     * Abstract method that should be defined by each specific class
     * @param  {String|Stream}  data      downloaded from the internet
     * @param  {ProcessorData}  state     the state to save the file
     * @param  {UrlStruct[]}    urlStruct containing the file name and the file path
     * @returns {Promise}
     */    
    saveFile: function(data, state, urlStruct) {
        return this.store.saveImage(data, state.storedata, urlStruct.name);
    },

    /**
     * Checks if this processor can process the given URL path
     * @param  {String} url
     * @param  {[ProcessorData]}    state
     * @return {Boolean} - returns true if it can process, false otherwise
     */
    apply: function(url, state) {  
        return url.indexOf(".jpg") != -1 
                || url.indexOf(".png") != -1
                || url.indexOf(".jpeg") != -1
                || url.indexOf(".gif") != -1;
    },

    /**
     * Hook method to return posProcessor data
     * @param  {ProcessorData} state   
     * @param  {String} baseUrl 
     * @param  {Engine} engine  
     * @return {PosProcessorData}  The pos processor data to call posProcessor
     */    
    getPosProcessorsData: function(state, baseUrl, engine) { 
        return null;
    }
});

// exports the processor
module.exports = imgProcessor;