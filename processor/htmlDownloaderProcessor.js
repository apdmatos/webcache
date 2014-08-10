var utils           = require('./../util')      ,
    baseProcessor   = require('./processor')    ,
    util            = require('util')           ,
    utils           = require('./../util')      ,
    logger          = require('../logger')      ;

/**
 * Gets all the HTML and stores it.
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 */
function htmlDownloaderProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

};

util.inherits(htmlDownloaderProcessor, baseProcessor);
utils.extend(htmlDownloaderProcessor.prototype, {

    /**
     * Process the document content
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return {Promise[ProcessorData]}
     */
    process: function(page, state) {

        logger.info('html downloader processor...');
        baseProcessor.prototype.process.apply(this, arguments);

        var self = this;
        
        return page.evaluate(function () {
            return document.getElementsByTagName('html')[0].innerHTML;
        }).then(function(html) {
            
            logger.info('saving html for ' + state.pageUrl);
            return self.store.saveHtmlPage(html, state.storedata);
        });
    }
});

module.exports = htmlDownloaderProcessor;