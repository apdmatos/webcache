

/**
 * ******************* Dependencies *******************
 * Abstract processor dependencies
 */
var utils           = require('./../util'),
    processorData   = require('./processorData');


/**
 * Processor constructor
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 */
function processor(nextProcessor, store) {

    this.nextProcessor  = nextProcessor;
    this.store          = store;
}


utils.extend(processor.prototype, {

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

        if (!state) {

            state = new processorData.create(url);

        }

        return state;
    },

    /**
     * Begins the next processor execution
     * @param  {[String]}           url
     * @param  {[Engine]}           engine
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @param  {Function}           done
     */
    next: function(url, engine, page, state, done) {
        if(this.nextProcessor) {
            this.nextProcessor.process(url, engine, page, state, done);
        }else {
            done();
        }
    }
});


/**
 * Export the module to be used by other scripts. 
 * This is an abstract class, that should be used to define processors
 * @type {[Processor]}
 */
module.exports = processor;

