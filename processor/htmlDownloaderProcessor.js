

var utils = require('./../util');

var processor = require('./processor');
var util = require('util');
var utils = require('./../util');

function htmlDownloaderProcessor() {
    // call base constructor
    processor.apply(this, arguments);

};

util.inherits(htmlDownloaderProcessor, processor);

utils.extend(htmlDownloaderProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        var self = this;
        // base.process
        state = processor.prototype.process.apply(this, arguments);


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