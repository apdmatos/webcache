


var JQUERY_SCRIPT_LOCATION = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";

var utils = require('./../util');

var baseProcessor = require('./processor');
var util = require('util');
var utils = require('./../util');


function loadScriptProcessor() {
    // call base constructor
    baseProcessor.apply(this, arguments);

};

util.inherits(loadScriptProcessor, baseProcessor);

utils.extend(loadScriptProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('load script processor...');

        var self = this;
        // base.process
        state = baseProcessor.prototype.process.apply(this, arguments);

        var callback = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
        page.evaluate(function () {
            return JQuery;
        }, function(err, jquery){

            if(!jquery) {

                console.log('including jquery...');

                // load jquery in the page
                page.includeJs(JQUERY_SCRIPT_LOCATION, function(e) {

                    callback();

                });
            } else {

                console.log('jquery already included on the webpage...');
                callback(); 

            }
            
        });

        return state;
    }
});

module.exports = loadScriptProcessor;
