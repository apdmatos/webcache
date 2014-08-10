var basePosProcessor = require('./posProcessor')    ,
    util             = require('util')              ,
    utils            = require('./../../util')      ,
    RSVP             = require('rsvp')              ;

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
     * @param  {String} file
     * @param  {Function} regexApplier
     * @param  {Regexp[]} regexps
     * @param  {RegexPosProcessorData} posProcessorData
     * @return {Promise}
     */
    processFile: function(file, regexps, posProcessorData) {

        var self = this;

        return new RSVP.Promise(function(resolve, reject){
            
            function execute(idx) {
                
                if(regexps.length == idx) {
                    return resolve(file);
                }

                var regex = regexps[idx];
                self.replace(file, regex, posProcessorData)
                    .then(function(replacedFile) {
                        file = replacedFile;
                        execute(idx + 1);
                    });
            }

            execute(0);
        });
    },

    /**
     * [replace description]
     * @param  {String} file
     * @param  {Regexp} regexps
     * @param  {RegexPosProcessorData} posProcessorData
     * @return {Promise(string)}
     */
    replace: function(file, regex, posProcessorData) {
        /* must be implemented by each implementation*/
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