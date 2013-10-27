
////////////////////////////
// purpose:
// 	 Downloads all the images on the page and stores them on a local 
// 	 folder changing the URL to a relative one


// Processor dependencies
var baseProcessor = require('./elementDownloaderProcessor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');



// processor constructor
function imgProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

}


util.inherits(imgProcessor, baseProcessor);

utils.extend(imgProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('img processor...');
        state = baseProcessor.prototype.process.apply(this, arguments);
        this.processElement(url, engine, page, state, 'img', 'src', done);
    },

    // Abstract method that should be defined by each specific class
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

    // Abstract method that should be defined by each specific class
    // param data {Buffer} data downloaded from the internet
    // param state {ProcessorData}
    // param urlStruct {UrlStruct} containing the file name and the file path
    // param doneFunc {Function(err)}
    saveFile: function(data, state, urlStruct, doneFunc) { 
    	this.store.saveImage(data, state.storedata, urlStruct.name, doneFunc);
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
                || url.indexOf(".gif") != -1;;
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




