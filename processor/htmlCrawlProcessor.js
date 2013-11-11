

// Processor dependencies
var baseProcessor 	= require('./processor'),
	urlMod 			= require('url'),
	util 			= require('util'),
	utils 			= require('./../util'),
	phantomFunc 	= require('../node-phantom-extensions/parameterFunction');



/**
 * Follows the links and downloads the next pages
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 */
function htmlCrawlProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

}


util.inherits(htmlCrawlProcessor, baseProcessor);

utils.extend(htmlCrawlProcessor.prototype, {

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

        console.log('html crawl processor...');
        var self = this;
        state = baseProcessor.prototype.process.apply(this, arguments);
        
        self.next(url, engine, page, state, done);
    }


});




// exports the processor
module.exports = htmlCrawlProcessor;








