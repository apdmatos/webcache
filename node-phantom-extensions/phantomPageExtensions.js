var phantom             = require('node-phantom')                    ,
    util                = require('../util')                         ,
    RSVP                = require('rsvp')                            ,
    defaultRetryCount   = require('./defaults').defaultRetryCount    ,
    defaultTimeout      = require('./defaults').defaultTimeout       ;

/**
 * Wrapper object to a phantom page. 
 * Adds some funcionality to it by adding the timeout capability while creating new pages
 * @param {PhantomPage} phantomPage the created page proxy to add functionality to
 */
function PhantomPageWrapper(phantomPage, maxRetries, timeout) {
    this.phantomPage = phantomPage;
    this.maxRetries = maxRetries || defaultRetryCount;
    this.timeout = timeout || defaultTimeout;
}

PhantomPageWrapper.prototype = {

    /**
     * opens a page on the given url with a timeout. 
     *
     * @param  {string?}               url        the url to open a page
     * @param  {int?}                  timeout    the timeout to wait for the page to be created.
     * @param  {int?}                  retryCount if it fails, the number of times to retry the page opening
     * @returns {Promise{status, PhantomPage}}
     */
    open: function(url) {

        var phantomPage = this.phantomPage;
        var self = this;
        var deferred = RSVP.defer();

        function openPhantomPage(retry) {

            var successCallback = function(err, status) {
                if(err || status != 'success') {
                    if(retry == self.maxRetries) {
                        phantomPage.close();
                        deferred.reject(err, status, self)
                    } else {
                        openPhantomPage(retry + 1);
                    }
                } else {
                    deferred.resolve(status, self);
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    phantomPage.close();
                    deferred.reject('timeout opening the page for url ' + url + ' after a number of ' + retry + ' retries.', null, self);
                }else {
                    openPhantomPage(retry + 1);
                }
            }

            phantomPage.open(
                url
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        openPhantomPage(0);
        return deferred.promise;
    },

    close: function(callback) {

        var deferred = RSVP.defer();

        this.phantomPage.close(function(err) {
            if(err) {
                return deferred.reject(err);
            }

            deferred.resolve();
        });

        return deferred;
    },

    /**
     * renders a page with a given filename with a timeout. 
     *
     * @param  {string}               filename        the filename to generate the image
     * @returns {Promise}
     */
    render: function(filename){
        
        var self = this;
        var deferred = RSVP.defer();


        function render(retry) {

            var successCallback = function(err) {
                if(err) {
                    if(retry == self.maxRetries) {
                        deferred.reject(err);
                    } else {
                        render(retry + 1);
                    }
                } else {
                    deferred.resolve();
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    deferred.reject('timeout rendering page to base64');
                }else {
                    render(retry + 1);
                }
            }

            self.phantomPage.render(filename
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        render(0);

        return deferred;
    },

    /**
     * [renderBase64 description]
     * @param  {String}   extension [description]
     * @returns {Promise{Buffer}}
     */
    renderBase64: function(extension) {

        var self = this;
        var deferred = RSVP.defer();

        function renderBase64(retry) {

            var successCallback = function(err, imagedata) {
                if(err) {
                    if(retry == self.maxRetries) {
                        deferred.reject(err);
                    } else {
                        renderBase64(retry + 1);
                    }
                } else {
                    deferred.resolve(imagedata);
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    deferred.reject('timeout rendering page to base64');
                }else {
                    renderBase64(retry + 1);
                }
            }

            self.phantomPage.renderBase64(extension
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        renderBase64(0);
        return deferred.promise;
    },

    injectJs: function(url) {

        var self = this;
        var deferred = RSVP.defer();

        function injectJS(retry) {

            var successCallback = function(err) {
                if(err) {
                    if(retry == self.maxRetries) {
                        deferred.reject(err);
                    } else {
                        injectJS(retry + 1);
                    }
                } else {
                    deferred.resolve();
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    deferred.reject('timeout rendering page to base64');
                }else {
                    injectJS(retry + 1);
                }
            }

            self.phantomPage.injectJs(url
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        injectJS(0);

        return deferred;
    },

    includeJs: function(url) {

        var self = this;
        var deferred = RSVP.defer();

        function includeJS(retry) {

            var successCallback = function(err) {
                if(err) {
                    if(retry == self.maxRetries) {
                        deferred.reject(err);
                    } else {
                        includeJS(retry + 1);
                    }
                } else {
                    deferred.resolve();
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    deferred.reject('timeout rendering page to base64');
                }else {
                    includeJS(retry + 1);
                }
            }

            self.phantomPage.includeJs(url
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        includeJS(0);

        return deferred;
    },

    sendEvent: function(event, x, y) {

        var self = this;
        var deferred = RSVP.defer();

        function sendEvent(retry) {

            var successCallback = function(err) {
                if(err) {
                    if(retry == self.maxRetries) {
                        deferred.reject(err);
                    } else {
                        sendEvent(retry + 1);
                    }
                } else {
                    deferred.resolve();
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    deferred.reject('timeout rendering page to base64');
                }else {
                    sendEvent(retry + 1);
                }
            }

            self.phantomPage.sendEvent(event, x, y
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        sendEvent(0);

        return deferred;
    },

    uploadFile: function(selector, filename) {

        var self = this;
        var deferred = RSVP.defer();

        function uploadFile(retry) {

            var successCallback = function(err) {
                if(err) {
                    if(retry == self.maxRetries) {
                        deferred.reject(err);
                    } else {
                        uploadFile(retry + 1);
                    }
                } else {
                    deferred.resolve();
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    deferred.reject('timeout rendering page to base64');
                }else {
                    uploadFile(retry + 1);
                }
            }

            self.phantomPage.uploadFile(selector, filename
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        uploadFile(0);

        return deferred;
    },

    evaluate: function(evaluator) {

        var phantomPage = this.phantomPage;
        var self = this;
        var deferred = RSVP.defer();

        function evaluate(retry) {

            var successCallback = function(err, result) {
                if(err) {
                    if(retry == self.maxRetries) {
                        deferred.reject(err);
                    } else {
                        evaluate(retry + 1);
                    }
                } else {
                    deferred.resolve(result);
                }
            };

            var timeoutCallback = function() {
                if(retry == self.maxRetries) {
                    deferred.reject('timeout rendering page to base64');
                }else {
                    evaluate(retry + 1);
                }
            }

            self.phantomPage.evaluate(evaluator
                , util.timeout(successCallback, timeoutCallback, self.timeout));
        }

        evaluate(0);
        return deferred;
    },
    
    set: function(name, value) {
        var deferred = RSVP.defer();

        this.phantomPage.set(name, value, function(err) {
            if(err) {
                return deferred.reject(err);
            }

            deferred.resolve();
        });

        return deferred;
    },

    get: function(name) {

        var deferred = RSVP.defer();

        this.phantomPage.get(name, function(err, result) {
            if(err) {
                return deferred.reject(err);
            }

            deferred.resolve(result);
        });

        return deferred;
    },

    setViewport: function(viewport) {
        
        var deferred = RSVP.defer();

        this.phantomPage.setViewport(viewport, function(err) {
           if(err) {
                return deferred.reject(err);
            }

            deferred.resolve(); 
        });

        return deferred;
    }
};

module.exports = PhantomPageWrapper;