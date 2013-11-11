
var utils           = require('./../util'),
    baseProcessor   = require('./processor'),
    util            = require('util'),
    utils           = require('./../util');


/**
 * @constructor
 * Gets a pages's print screen and stores it locally
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 */
function previewProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

};

util.inherits(previewProcessor, baseProcessor);
utils.extend(previewProcessor.prototype, {

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

        console.log('preview processor...');

        var self = this;
        // base.process
        state = baseProcessor.prototype.process.apply(this, arguments);

        var callback = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
        console.log('rendering image to base64...');
        page.renderBase64('png',function(err, imagedata){
            console.log('rendered image to base64. Saving...');
            var buffer = new Buffer(imagedata, 'base64');
            self.store.saveWebsitePreview(buffer, state.storedata, callback);
        });

        return state;
    }
});

module.exports = previewProcessor;