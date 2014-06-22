var basePosProcessor = require('./posProcessor')    ,
    util             = require('util')              ,
    utils            = require('./../../util')      ;



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
     * @param  {Function(file)} done - to be called when done
     * @return {void}
     */
    process: function(file, posProcessorData, done) {

        //this._processRegexIdx(0, file, posProcessorData, done);
        
        var self             = this;
        var state            = posProcessorData.processorState;
        var regexps          = posProcessorData.regexps;
        var waitFn           = utils.waitForCallbacks(function() { done(file); }, this);
        var waitForProcessor = false;

        // {url, urlStruct}
        var processedUrls = {};

        function applyRegex(match, p1, p2, p3, offset, string) {
            var url = p1;
            var processor = self._getProcessorToDownload(url, state);
            if(!processor) 
            {
                // leave it as it is! Do nothing...
                return match;
            } 


            var localUrl;
            if(processedUrls[url]) {
                
                localUrl = processedUrls[url].localUrl;

            }else {

                waitForProcessor = true;
                var fn = waitFn();
                
                var name = self.generateName(url);
                localUrl = posProcessorData.relPath + '/' + name;

                processedUrls[url] = {
                    url: url, 
                    localUrl: localUrl,
                    name: name
                };

                processor.downloadAsset(
                    posProcessorData.baseUrl, 
                    processedUrls[url],
                    posProcessorData.engine, 
                    state, 
                    fn
                );
            }

            
            return match.replace(url, localUrl);
        }

        var regex;
        for(var i = 0, len = regexps.length; i < len; ++i) {
            regex = regexps[i];
            file = file.replace(regex, applyRegex, "gi");
        }    
        
        
        if(!waitForProcessor) {
            done(file);
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
            fileName = urlParts[urlParts.length - 1].split('?')[0];

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