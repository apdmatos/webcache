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
        logger.info('executing preview processor for url ', state.url);
        
        return new RSVP.Promise(function(resolve, reject){
            logger.info('rendering page url ", state.url, " base64');

            page.renderBase64('png',function(err, imagedata){
                if(err) {
                    logger.error('error while rendering page', state.url, ' image to base64. Error: ', err);
                    reject(err);
                    return;
                }

                console.info('rendered page image', state.url, ' to base64. Saving...');
                var buffer = new Buffer(imagedata, 'base64');
                
                // save image on the store                
                self.store.saveWebsitePreview(buffer, state.storedata)
                    .then(function() {
                        return self.next(page, state);
                    })
                    .then(function() {
                        resolve(state);
                    })
                    .catch(function(error) {
                        reject(error);
                    });
                
            });
        });
    }
});

module.exports = previewProcessor;