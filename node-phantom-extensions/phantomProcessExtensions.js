var phantom             = require('node-phantom')                    ,
    phantomPageExt      = require('./phantomPageExtensions')         ,
    util                = require('../util')                         ,
    RSVP                = require('rsvp')                            ,
    defaultRetryCount   = require('./defaults').defaultRetryCount    ,
    defaultTimeout      = require('./defaults').defaultTimeout       ,
    defaultPageSize     = require('./defaults').defaultPageSize      ;

module.exports = {
    /**
     * Helper function to create a phantom process
     * @param  {int}                       timeout The timeout to wait for the process to be created
     * @param  {int}                       retryCount Number of retries to create a phantom process
     * @returns {Promise{PhantomProcess}}
     */
    createPhantomProcess: function(timeout, retryCount) {
        timeout = timeout || defaultTimeout;
        retryCount = retryCount || defaultRetryCount;
        var deferred = RSVP.defer();

        function createProcess(retry) {

            var successCallback = function (err, ph) {
                if(err) {
                    if(retry == retryCount) {
                        deferred.reject('error creating phantom process after ' + retry + ' retries. error: ' + err);
                    }else {
                        createProcess(retry + 1);
                    }
                } else {
                    var phantomProcess = new PhantomProcessWrapper(ph);
                    deferred.resolve(phantomProcess);
                }
            };

            var timeoutCallback = function () {
                if(retry == retryCount) {
                    deferred.reject('timeout creating phantom process after ' + retry + ' retries');    
                }else {
                    createProcess(retry + 1);
                }
            }

            var disposeCallback = function(err, ph) {
                if(ph) {
                    ph.exit();
                }
            }

            phantom.create(util.timeout(
                    successCallback,
                    timeoutCallback, 
                    timeout
                ));
        }

        createProcess(0);

        return deferred.promise;
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
     * Helper function that creates an opens a page with separated callbacks for success and error
     * @param  {String} url
     * @param  {int?} timeout
     * @param  {int?} retryCount
     * @returns {Promise{PhantomPage}}
     */
    openPage: function(url, timeout, retryCount) {

        return this.createPage(timeout, url, retryCount);
    },

    /**
     * create a phantom process page with a timeout. 
     * Optionally open the page on the given url
     * 
     * @param  {int?}                  timeout    the timeout to wait for the page to be created.
     * @param  {string?}               url        the url to open a page
     * @param  {int?}                  retryCount if it fails, the number of times to retry the page opening
     * @returns {Promise{PhantomPage}}
     */
    createPage: function(timeout, url, retryCount) {

        timeout = timeout || defaultTimeout;
        retryCount = retryCount || defaultRetryCount;
        var phantomProcess = this.phantomProcess;
        var deferred = RSVP.defer();

        function createPhantomPage(retry) {

            var successCallback = function(err, page) {
                if(err) {
                    if(retry == retryCount) {
                        deferred.reject('error creating phantom process after ' + retry + ' retries. error: ' + err);
                    } else {
                        createPhantomPage(retry + 1);
                    } 
                }else {

                    page.set('viewportSize', defaultPageSize);
                    var phantomPage = new phantomPageExt(page, retryCount, timeout);
                    if(url) {
                        phantomPage.open(url)
                                   .then(function(page) {
                                        deferred.resolve(page);
                                   })
                                   .catch(function(err) {
                                        deferred.reject(err);
                                   });
                    } else {
                        deferred.resolve(phantomPage);
                    }
                }
            };

            var timeoutCallback = function() {
                if(retry == retryCount) {
                    deferred.reject('timeout creating phantom process after ' + retry + ' retries.');
                }else {
                    createPhantomPage(retry + 1);
                }
            }

            var disposeCallback = function(err, page) {
                if(!err) {
                    page.close();
                }
            }

            phantomProcess.createPage(
                util.timeout(successCallback, timeoutCallback, timeout, disposeCallback));
        }

        createPhantomPage(0);
        return deferred.promise;
    },

    // injectJs: function() {
    //     return this.phantomProcess.injectJs.apply(this.phantomProcess, arguments);
    // },

    // addCookie: function() {
    //     return this.phantomProcess.addCookie.apply(this.phantomProcess, arguments);
    // },

    exit: function() {
        return this.phantomProcess.exit.apply(this.phantomProcess, arguments);
    },

    on: function() {
        return this.phantomProcess.on.apply(this.phantomProcess, arguments);
    }
};