


var JQUERY_SCRIPT_LOCATION = "http://codeorigin.jquery.com/jquery-1.8.0.min.js";

var utils = require('./../util');

var processor = require('./processor');
var util = require('util');
var utils = require('./../util');


function loadScriptProcessor() {
    // call base constructor
    processor.apply(this, arguments);

};

util.inherits(loadScriptProcessor, processor);

utils.extend(loadScriptProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        var self = this;
        // base.process
        state = processor.prototype.process.apply(this, arguments);

        var callback = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
        page.evaluate(function () {
            return JQuery;
        }, function(err, jquery){

            if(!jquery) {

                console.log('including jquery...');

                // load jquery in the page
                page.injectJs(JQUERY_SCRIPT_LOCATION, function(e) {

                    callback();

                });
            }

            console.log('jquery already included on the webpage...');
            callback();
        });

        return state;
    }
});

module.exports = loadScriptProcessor;
