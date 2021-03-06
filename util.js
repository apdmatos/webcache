var type = require('elucidata-type');

/**
 * Utility functions to be used on the code
 */
module.exports = {

    /**
     * prints the error if a stack is present
     * @param  {Logger} logger 
     * @param  {Error} err    
     */
    printError: function(logger, err) {

        function print(error) {
            logger.error(error);
            if(error.stack) {
                logger.error(error.stack);    
            }
        }

        if(err) {
            if(type.isArray(err)) {

                for (var i = 0; i < err.length; ++i) {
                    print(err[i]);
                }

            } else {
                print(err);
            }
        }
    },

    /**
     * @returns {string} a new random guid
     */
    newGuid: function() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
    },

    /**
     * Returns an empty function if the function given is null
     * @param  {Function} callback 
     * @return {Function} 
     */
    callbackOrDummy: function(callback) {
        if(!callback) callback = function (){}
        return callback;
    },

    /**
     * Wraps a function to be executed on a specific context when called
     * @param  {Function}   callback [description]
     * @param  {Object}     context  [description]
     * @param  {Object[]}   params   [description]
     * @return {Function}
     */
    callbackWrapper: function(callback, context, params) {
        return function() {
            if(callback) {
                params = params || [];
                params = params.concat([].slice.call(arguments));
                return callback.apply(context, params);
            }
        }
    },

    /**
     * Callbacks a function only once
     * @param  {Function} callback   [description]
     * @param  {Object}   context    [description]
     * @param  {Object[]}   params   [description]
     * @return {Function}            [description]
     */
    callbackOnce: function(callback, context, params) {
        var alreadyExecuted = false;
        return function() {
            if(!callback || alreadyExecuted) {
                return;
            }

            alreadyExecuted = true;
            params = params || [];
            params = params.concat([].slice.call(arguments));
            return callback.apply(context, params);
        }
    },

    /**
     * Extends an object with the other object properties
     * @return {Object}
     */
    extend: function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false,
            toString = Object.prototype.toString,
            hasOwn = Object.prototype.hasOwnProperty,
            push = Array.prototype.push,
            slice = Array.prototype.slice,
            trim = String.prototype.trim,
            indexOf = Array.prototype.indexOf,
            class2type = {
                "[object Boolean]": "boolean",
                "[object Number]": "number",
                "[object String]": "string",
                "[object Function]": "function",
                "[object Array]": "array",
                "[object Date]": "date",
                "[object RegExp]": "regexp",
                "[object Object]": "object"
            },
            jQuery = {
                isFunction: function (obj) {
                    return jQuery.type(obj) === "function"
                },
                isArray: Array.isArray ||
                    function (obj) {
                        return jQuery.type(obj) === "array"
                    },
                isWindow: function (obj) {
                    return obj != null && obj == obj.window
                },
                isNumeric: function (obj) {
                    return !isNaN(parseFloat(obj)) && isFinite(obj)
                },
                type: function (obj) {
                    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
                },
                isPlainObject: function (obj) {
                    if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
                        return false
                    }
                    try {
                        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                            return false
                        }
                    } catch (e) {
                        return false
                    }
                    var key;
                    for (key in obj) {}
                    return key === undefined || hasOwn.call(obj, key)
                }
            };
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {}
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (i; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue
                    }
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : []
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        // WARNING: RECURSION
                        target[name] = extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    },

    /**
     * Function to execute a bunch of functions in parallel and wait for all the callbacks to procced
     * @param  {Function} doneFn The function to be executed when all the callbacks have executed
     */
    waitForCallbacks: function(doneFn, context) {

        var waiting = 0;
        context = context || this;
        return function () {
            ++waiting;
            return function() {
                if(--waiting === 0){
                    doneFn.apply(context, arguments);
                }
            }
        }
    },

    /**
     * Returns the first key presented in the object if any
     * @param  {Object} 
     * @return {String}     The first object key
     */
    getFirstKey: function(obj) {
        if(!obj) return null;

        for (var elem in obj) {
            return elem;
        }
    },

    /**
     * [timeout description]
     * @param  {Function?}  callback        A callback to be execute in case of success
     * @param  {Function?}  timeoutCallback A callback to be executed in case of timeout
     * @param  {int?}       timeout         The default timeout value
     * @param  {Function?}  disposeFunc A function to be called if and when the callback applies, after the timeout occures
     * @return {Function} a function with a default time to be executed
     */
    timeout: function(callback, timeoutCallback, timeout, disposeFunc) {
        
        // default values
        timeout = timeout ? timeout : 5000;
        callback = this.callbackWrapper(callback);
        timeoutCallback = this.callbackWrapper(timeoutCallback);
        disposeFunc = this.callbackWrapper(disposeFunc);

        var ignoreTimeout = false;
        var timedout = false;
        var id = setTimeout(function() {
            if(ignoreTimeout) {
                return;
            }
            timedout = true;
            timeoutCallback();
        }, timeout);

        var callbackRunnedOnce = false;
        return function() {
            if(callbackRunnedOnce) { return; }
            callbackRunnedOnce = true;
            ignoreTimeout = true;

            // if the timeout occurred, do nothing
            if(timedout){
                if(disposeFunc) {
                    disposeFunc(this, arguments);
                }
                return;
            }
            
            clearTimeout(id);
            callback.apply(this, arguments);
        };
    }


};