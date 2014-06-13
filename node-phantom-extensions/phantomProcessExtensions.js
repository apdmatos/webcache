var phantom        = require('node-phantom')               ,
    phantomPageExt = require('./phantomPageExtensions')    ,
    timeoutFunc    = require('../util').timeout            ;

var defaultRetryCount = 1;
var defaultTimeout = 10000;

module.exports = {
    /**
     * Helper function to create a phantom process
     * @param  {Fucnction(PhantomProcess)} success Called when the process is created successfully
     * @param  {Function(message)}         error   Called when the process could not be created
     * @param  {int}                       timeout The timeout to wait for the process to be created
     * @param  {int}                       retryCount Number of retries to create a phantom process
     */
    createPhantomProcess: function(success, error, timeout, retryCount) {

        timeout = timeout || defaultTimeout;
        retryCount = retryCount || defaultRetryCount;

        function createProcess(retry) {


            var successCallback = function (err, ph) {
                if(err) {
                    if(retry == retryCount) {
                        error('error creating phantom process after ' + retry + ' retries. error: ' + err);
                    }else {
                        createProcess(retry + 1);
                    }
                } else {
                    var phantomProcess = new PhantomProcessWrapper(ph);
                    success(null, phantomProcess);
                }
            };

            var timeoutCallback = function () {
                if(retry == retryCount) {
                    error('timeout creating phantom process after ' + retry + ' retries');    
                }else {
                    createProcess(retry + 1);
                }
            }

            var disposeCallback = function(err, ph) {
                if(!err) {
                    ph.exit();
                }
            }



            phantom.create(timeoutFunc(
                    successCallback,
                    timeoutCallback, 
                    timeout
                ));

                
            });
        }

        createProcess(0);
    }
};


/**
 * Wrapper object to a phantom process. Adds some funcionality to it by adding the timeout capability 
 * while creating new processes/pages
 * @param {PhantomProcess} phantomProcess the created phantomProcess proxy to add functionality to
 */
function PhantomProcessWrapper(phantomProcess) {
    this.phantomProcess = phantomProcess;
}

PhantomProcessWrapper.prototype = {

    /**
     * create a phantom process page with a timeout. 
     * Optionally open the page on the given url
     * 
     * @param  {Function(phantomPage)} callback   The phantomPage to interact to
     * @param  {int?}                  timeout    the timeout to wait for the page to be created.
     * @param  {string?}               url        the url to open a page
     * @param  {int?}                  retryCount if it fails, the number of times to retry the page opening
     */
    createPage: function(callback, timeout, url, retryCount) {

        //timeout: function(callback, timeoutCallback, timeout, disposeFunc) {
        
        timeout = timeout || defaultTimeout;
        retryCount = retryCount || defaultRetryCount;
        var phantomProcess = this.phantomProcess;

        function createPhantomPage(retry) {

            var successCallback = function(err, page) {
                if(err) {
                    if(retry == retryCount) {
                        callback('error creating phantom process after ' + retry + ' retries. error: ' + err);
                    } else {
                        createPhantomPage(retry + 1);
                    } 
                }else {

                    var phantomPage = new phantomPageExt(page);
                    if(url) {
                        phantomPage.open(url, callback, timeout, retryCount);
                    } else {
                        callback(null, phantomPage);
                    }
                }
            };

            var timeoutCallback = function() {
                if(retry == retryCount) {
                    callback('timeout creating phantom process after ' + retry + ' retries.');
                }else {
                    createProcess(retry + 1);
                }
            }

            var disposeCallback = function(err, page) {
                if(!err) {
                    page.close();
                }
            }

            phantomProcess.createPage(
                timeoutFunc(successCallback, timeoutCallback, timeout, disposeCallback));
        }

        createPhantomPage(0);

    },

    injectJs: function() {
        return this.phantomProcess.injectJs.apply(this.phantomProcess, arguments);
    },

    addCookie: function() {
        return this.phantomProcess.addCookie.apply(this.phantomProcess, arguments);
    },

    exit: function() {
        return this.phantomProcess.exit.apply(this.phantomProcess, arguments);
    },

    on: function() {
        return this.phantomProcess.on.apply(this.phantomProcess, arguments);
    }
};