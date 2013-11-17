
// Processor dependencies
var baseProcessor   = require('./elementDownloaderProcessor')   ,
    urlMod          = require('url')                            ,
    util            = require('util')                           ,
    utils           = require('./../util')                      ;



/**
 * @constructor
 * Abstract class to download javascript assets
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {RegexPosProcessor} regexProcessor
 */
function jsProcessor(nextProcessor, store, regexProcessor) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store, regexProcessor]);

}

util.inherits(jsProcessor, baseProcessor);
utils.extend(jsProcessor.prototype, {

    /**
     * Process the document content
     * @param  {[String]}           url
     * @param  {[Engine]}           engine
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @param  {Function}           done
     * @return {[ProcessorData]} if the state parameter is null, creates a new one
     */
    process: function(url, engine, page, state, done) {

        console.log('js processor...');
        state = baseProcessor.prototype.process.apply(this, arguments);
        this.processElement(url, engine, page, state, 'script', 'src', done);
    },

    /**
     * Abstract method that should be defined by each specific class
     * @return {String} The relative path to set on URL's
     */
    getRelativePath: function() { 
    	return this.store.getJSRelativePath();
    },

    /**
     * returns the file encoding
     * @return {String} the encoding
     */
    getEncoding: function() { 
        return 'utf8';
    }, 

    /**
     * Abstract method that should be defined by each specific class
     * @param  {String|Stream}  data      downloaded from the internet
     * @param  {ProcessorData}  state     the state to save the file
     * @param  {UrlStruct[]}    urlStruct containing the file name and the file path
     * @param  {Function}       doneFunc  Function to be executed
     */  
    saveFile: function(data, state, urlStruct, doneFunc) { 
    	this.store.saveJs(data, state.storedata, urlStruct.name, doneFunc);
    },

    /**
     * Checks if this processor can process the given URL path
     * @param  {String} url
     * @param  {[ProcessorData]}    state
     * @return {Boolean} - returns true if it can process, false otherwise
     */
    apply: function(url, state) {  
        return url.indexOf(".js") != -1;
    },

    /**
     * Hook method to return posProcessor data
     * @param  {ProcessorData} state   
     * @param  {String} baseUrl 
     * @param  {Engine} engine  
     * @return {PosProcessorData}  The pos processor data to call posProcessor
     */
    getPosProcessorsData: function(state, baseUrl, engine) { 
        // TODO: must be implemented...
        return null;
    }    

});




// exports the processor
module.exports = jsProcessor;










