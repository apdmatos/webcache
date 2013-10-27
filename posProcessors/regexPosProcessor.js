


var basePosProcessor 	= require('./posProcessor'),
	urlMod				= require('url'),
	util 			 	= require('util'),
	utils 				= require('./../util');



/**
 * Constructor to regexPosProcessor
 * @param  {ElementDownloaderProcessor[]} downloaderProcessors
 */
function regexPosProcessor(downloaderProcessors) {
	this.downloaderProcessors = downloaderProcessors;
};

util.inherits(regexPosProcessor, basePosProcessor);
utils.extend(regexPosProcessor.prototype, {

	/**
	 * Process data file
	 * @param  {String}   file
	 * @param  {RegexPosProcessorData}   posProcessorData
	 * @param  {Function} done - to be called when done
	 * @return {void}
	 */
    process: function(file, posProcessorData, done) {

    	//this._processRegexIdx(0, file, posProcessorData, done);
    	
    	var self = this;
    	var state = posProcessorData.processorState;
    	var regexps = posProcessorData.regexps;
    	var waitFn = utils.comulatingCallbacks(done, this);
    	var waitForProcessor = false;

    	function applyRegex(match, p1, p2, p3, offset, string) {
    		var url = p1.substring(1, p1.length);
    		var processor = self._getProcessorToDownload(url, state);
    		if(!processor) 
			{
				// leave it as it is! Do nothing...
				return match;
			} 

			waitForProcessor = true;
			var fn = waitFn();
			//var absoluteUrl = urlMod.resolve(posProcessorData.baseUrl, relUrl);
			var name = self.generateName(relUrl);
			var localUrl = posProcessorData.relUrl + '/' + name;

			processor.downloadAsset(
				posProcessorData.baseUrl, 
				{
					url: url, 
					localUrl: localUrl,
					name: name
				},
				posProcessorData.engine, 
				state, 
				posProcessorData.format, 
				fn
			);

    		return "url(" + localUrl;
    	}

    	
		for(var i = 0, len = regexps.length; i < len; ++i) {
    		file = file.replace(regex, applyRegex);
    	}	
    	
    	
    	if(!waitForProcessor) {
    		done();
    	}
    	
    },

    /**
     * Given a url generates a name for the file
     * @param  {String} url: the file url
     * @return {String}    : the file name
     */
	generateName: function(url) {
		
		// add the current name with a GUID appended
		var urlParts = url.split('/'),
			fileName = urlParts[urlParts.length - 1];

		return utils.newGuid() + fileName;
	},

    /**
     * returns the relative path for the entry being processed
     * @param fileUrl
     * @param state
     * @return {ElementDownloaderProcessor}
     */
    _getProcessorToDownload: function(fileUrl, state) {

        var processor = null;
    	for(var i = 0, len = this.downloaderProcessors.length; i < len; ++i) {

            processor = this.downloaderProcessors[i];

            if(processor.apply(fileUrl, state)) {
                return processor;
            }
        }

        return null;
    }
});


/**
 * Exports regexPosProcessor type
 */
module.exports = regexPosProcessor;