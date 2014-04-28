var utils           = require('./../util')              ,
    processorData   = require('./data/processorData')   ,
    RSVP            = require('rsvp')                   ,
    logger          = require('../logger')              ;


/**
 * Abstract processor
 * Processor constructor
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {[webAssetsClient]} webAssetsClient
 */
function processor(nextProcessor, store, webAssetsClient) {
    this.nextProcessor      = nextProcessor;
    this.store              = store;
    this.webAssetsClient    = webAssetsClient;
}


utils.extend(processor.prototype, {

    /**
     * Process the document content
     * @param  {[String]}           url
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return {Promise[ProcessorData]}
     */
    process: function(url page, state) {
        // Abstract method that should be implemented on each specific class
    },

    /**
     * Should undo all the work done by @process methid
     * @param  {[String]}           url
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return  {Promise}
     */
    compensate: function(url, page, state) {

        // TODO: must be implemented
        // Undo what was done
        
    },

    /**
     * Begins the next processor execution
     * @param  {[String]}           url
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @returns {Promise[ProcessorData]}
     */
    next: function(url, page, state) {

        if(this.nextProcessor) {
            logger.info('calling next processor');
            return this.nextProcessor.process(url, page, state);
        }
        
        logger.info('there is no next processor. Just returning...');
        // return an auto resolved promise
        return new RSVP.Promise(function(resolve, reject){
            resolve(state);  
        });
    }
});


/**
 * Export the module to be used by other scripts. 
 * This is an abstract class, that should be used to define processors
 * @type {[Processor]}
 */
module.exports = processor;

