


var JQUERY_SCRIPT_LOCATION = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";

var utils = require('./../util'),
    baseProcessor = require('./processor'),
    util = require('util'),
    utils = require('./../util');


/**
 * @constructor
 * Loads a javascript file on the page
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 */
function loadScriptProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

};

util.inherits(loadScriptProcessor, baseProcessor);
utils.extend(loadScriptProcessor.prototype, {

    /**
     * Process the document content
     * @param  {[String]}           url
     * @param  {[Engine]}           engine
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @param  {Function}           done
     * @return {[ProcessorData]} if the state parameter is null, creates a new one
     */
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
