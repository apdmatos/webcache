
var utils = require('./../util');

var processor = require('./processor');
var util = require('util');
var utils = require('./../util');

function previewProcessor() {
    // call base constructor
    processor.apply(this, arguments);

};

util.inherits(previewProcessor, processor);

utils.extend(previewProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('preview processor');

        var self = this;
        // base.process
        state = processor.prototype.process.apply(this, arguments);

        var callback = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
        page.renderBase64('png',function(err, imagedata){
            var buffer = new Buffer(imagedata, 'base64');
            self.store.saveWebsitePreview(buffer, state.storedata, callback);
        });

        return state;
    }
});

module.exports = previewProcessor;