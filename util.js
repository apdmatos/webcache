

var fs = require('fs');




/**
 * Utility functions to be used on the code
 */
module.exports = {

    /**
     * Creates a directory if does not exist yet
     * @param dir {String} the directory to create if does not exist yet
     * @param done {Function(Boolean)} function that receives a boolean parameter indication if the directory was created
     */
    createDirIfDoesNotExist: function(dir, done) {

        fs.exists(dir, function(exists){

            if(!exists) {

                fs.mkdir(dir, function(){ done(true); });

            } else {

                done(false);
            }
        });
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
                var parameters = params ? params : arguments;
                callback.apply(context, parameters);
            }
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
    }


};