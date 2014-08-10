var baseProcessor   = require('./processor')    ,
    util            = require('util')           ,
    utils           = require('./../util')      ,
    RSVP            = require('rsvp')           ,
    logger          = require('../logger')      ;


/**
 * @constructor
 * Gets a pages's print screen and stores it locally
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {[webAssetsClient]} webAssetsClient
 */
function previewProcessor(nextProcessor, store, webAssetsClient) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store, webAssetsClient]);
};

util.inherits(previewProcessor, baseProcessor);
utils.extend(previewProcessor.prototype, {

    /**
     * Process the document content
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return {Promise[ProcessorData]}
     */
    process: function(page, state) {
        
        baseProcessor.prototype.process.apply(this, arguments);

        var self = this;
        logger.info('executing preview processor for url ' + state.pageUrl);
        logger.info('rendering page url ', state.pageUrl, ' base64');

        return page.renderBase64('png')
            .then(
                // success
                function(imagedata) {
                    logger.info('rendered page image' + state.pageUrl + ' to base64. Saving...');
                    var buffer = new Buffer(imagedata, 'base64');
                    return self.store.saveWebsitePreview(buffer, state.storedata)
                },
                // error
                function(err) {
                    logger.error('error while rendering page ' + state.pageUrl + ' image to base64. Error: ', err);
                    RSVP.Promise.reject(err);
                }
            )
            .then(function() {
                return self.next(page, state);
            });
    }
});

module.exports = previewProcessor;