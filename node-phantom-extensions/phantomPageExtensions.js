var phantom        = require('node-phantom')               ,
    timeoutFunc    = require('../util').timeout            ;


var defaultRetryCount = 1;
var defaultTimeout = 10000;

/**
 * Wrapper object to a phantom page. 
 * Adds some funcionality to it by adding the timeout capability while creating new pages
 * @param {PhantomPage} phantomPage the created page proxy to add functionality to
 */
function PhantomPageWrapper(phantomPage) {
    this.phantomPage = phantomPage;
}

PhantomPageWrapper.prototype = {

    /**
     * opens a page on the given url with a timeout. 
     *
     * @param  {string?}               url        the url to open a page
     * @param  {Function(phantomPage)} callback   The phantomPage to interact to
     * @param  {int?}                  timeout    the timeout to wait for the page to be created.
     * @param  {int?}                  retryCount if it fails, the number of times to retry the page opening
     */
    open: function(url, callback, timeout, retryCount) {

        //timeout: function(callback, timeoutCallback, timeout, disposeFunc) {
        
        timeout = timeout || defaultTimeout;
        retryCount = retryCount || defaultRetryCount;
        var phantomPage = this.phantomPage;
        var self = this;

        function openPhantomPage(retry) {

            var successCallback = function(err, status) {
                if(err || status != 'success') {
                    if(retry == retryCount) {
                        phantomPage.close();
                        callback(err, status, self);
                    } else {
                        createPhantomPage(retry + 1);
                    }
                } else {
                    callback(err, status, self);
                }
            };

            var timeoutCallback = function() {
                if(retry == retryCount) {
                    phantomPage.close();
                    callback('timeout opening the page for url ' + url + ' after a number of ' + retry + ' retries.', null, self);
                }else {
                    createProcess(retry + 1);
                }
            }

            phantomPage.open(
                url
                , timeoutFunc(successCallback, timeoutCallback, timeout));
        }

        openPhantomPage(0);

    },

    close: function(callback) {
        this.phantomPage.close.apply(this.phantomPage, arguments);
    },

    render: function(filename, callback){
        this.phantomPage.render.apply(this.phantomPage, arguments);
    },

    renderBase64: function(extension, callback){
        this.phantomPage.renderBase64.apply(this.phantomPage, arguments);
    },

    injectJs: function(url, callback){
        this.phantomPage.injectJs.apply(this.phantomPage, arguments);
    },

    includeJs: function(url, callback){
        this.phantomPage.includeJs.apply(this.phantomPage, arguments);
    },

    sendEvent: function(event, x, y, callback){
        this.phantomPage.sendEvent.apply(this.phantomPage, arguments);
    },

    uploadFile: function(selector, filename, callback){
        this.phantomPage.uploadFile.apply(this.phantomPage, arguments);
    },

    evaluate: function(evaluator, callback){
        this.phantomPage.evaluate.apply(this.phantomPage, arguments);
    },

    evaluateAsync: function(evaluator, callback){
        this.phantomPage.evaluateAsync.apply(this.phantomPage, arguments);
    },

    set: function(name, value, callback){
        this.phantomPage.set.apply(this.phantomPage, arguments);
    },

    get: function(name, callback){
        this.phantomPage.get.apply(this.phantomPage, arguments);
    },

    setFn: function(pageCallbackName, fn, callback) {
        this.phantomPage.setFn.apply(this.phantomPage, arguments);
    },

    setViewport: function(viewport, callback) {
        this.phantomPage.setViewport.apply(this.phantomPage, arguments);
    }
};


module.exports = PhantomPageExtensions;