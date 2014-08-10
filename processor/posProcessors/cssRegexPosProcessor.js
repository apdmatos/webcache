var basePosProcessor = require('./regexPosProcessor')    ,
    util             = require('util')                   ,
    utils            = require('./../../util')           ,
    RSVP             = require('rsvp')                   ,
    logger           = require('../../logger')           ;

var cssRegex = /url\s*\('?"?([^)]+\.(png|jpg|gif)(\?[a-z0-9]*)?)'?"?\)/g;

/**
 * Constructor to regexPosProcessor
 * @param  {ElementDownloaderProcessor[]} downloaderProcessors
 */
function cssRegexPosProcessor(downloaderProcessors) {
    basePosProcessor.apply(this, [downloaderProcessors]);
};

util.inherits(cssRegexPosProcessor, basePosProcessor);
utils.extend(cssRegexPosProcessor.prototype, {

    /**
     * Process data file
     * @param  {String}   file
     * @param  {RegexPosProcessorData}   posProcessorData
     * @return {Promise}
     */
    process: function(file, posProcessorData) {

        logger.info('running css pos processor on css file...');
        var state            = posProcessorData.processorState;

        return this.processFile(file, [cssRegex], posProcessorData);
    },

    /**
     * [replace description]
     * @param  {String} file
     * @param  {Regexp} regexps
     * @param  {RegexPosProcessorData} posProcessorData
     * @return {Promise(string)}
     */
    replace: function(file, regex, posProcessorData) {
        
        var self = this;
        // {url, urlStruct}
        var processedUrls = {};
        var promises = [];
        var state = posProcessorData.processorState;

        function applyRegex(match, p1, p2, p3, offset, string) {
            var url = p1;
            var processor = self._getProcessorToDownload(url, state);
            var promise = RSVP.resolve();

            if(!processor) 
            {
                promises.push(promise);

                // leave it as it is! Do nothing...
                return match;
            }

            var localUrl;
            if(processedUrls[url]) {
                
                localUrl = processedUrls[url].localUrl;

            } else {
                
                var name = self.generateName(url);
                localUrl = posProcessorData.relPath + '/' + name;

                processedUrls[url] = {
                    url: url, 
                    localUrl: localUrl,
                    name: name
                };

                var promise = processor.downloadAsset (
                    state, 
                    processedUrls[url]
                );
            }

            promises.push(promise);

            return match.replace(url, localUrl);
        }

        file = file.replace(regex, applyRegex, "gi");

        return RSVP.allSettled(promises)
            .then(function(result) {
                return file;
            });

    }
});

/**
 * Exports regexPosProcessor type
 */
module.exports = cssRegexPosProcessor;