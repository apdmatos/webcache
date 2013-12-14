
// processor dependencies
var utils           = require('./../util')      ,
    baseProcessor   = require('./processor')    ,
    util            = require('util')           ,
    utils           = require('./../util')      ;


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
     * @param  {[String]}           url
     * @param  {[Engine]}           engine
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @param  {Function}           done
     * @return {[ProcessorData]} if the state parameter is null, creates a new one
     */
    process: function(url, engine, page, state, done) {

        console.log('html downloader processor...');

        var self = this;
        // base.process
        state = baseProcessor.prototype.process.apply(this, arguments);


        var callback = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
        page.evaluate(function () {
            return document.getElementsByTagName('html')[0].innerHTML;
        }, function(err, html){
            console.log('saving html...');
            self.store.saveHtmlPage(html, state.storedata, callback);
        });

        return state;
    }
});

module.exports = htmlDownloaderProcessor;