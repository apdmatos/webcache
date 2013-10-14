
var utils = require('./../util');

var baseProcessor = require('./processor');
var util = require('util');
var utils = require('./../util');

function previewProcessor() {
    // call base constructor
    baseProcessor.apply(this, arguments);

};

util.inherits(previewProcessor, baseProcessor);

utils.extend(previewProcessor.prototype, {

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