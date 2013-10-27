

var utils = require('./../util');

var baseProcessor = require('./processor');
var util = require('util');
var utils = require('./../util');

function htmlDownloaderProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

};

util.inherits(htmlDownloaderProcessor, baseProcessor);

utils.extend(htmlDownloaderProcessor.prototype, {

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