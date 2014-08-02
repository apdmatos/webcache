
// processor dependencies
var baseProcessor   = require('./processor')           ,
    utils           = require('./../util')              ,
    util            = require('util')                   ,
    RSVP            = require('rsvp')                   ,
    logger          = require('../logger')              ;


var JQUERY_SCRIPT_LOCATION = "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";


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
     * Loads a JQuery script to perform queries on the webpage
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return {Promise[ProcessorData]}
     */
    process: function(page, state) {

        logger.info('load script processor for url ', state.pageUrl);

        var self = this;
        // base.process
        baseProcessor.prototype.process.apply(this, arguments);


        return page.evaluate(self._jqueryEvaluatorFunc)
            .then(
                function(jquery) {
                    return self._includeJQueryDecisor(page, jquery);
                }
                // error
                , function(err) {
                    logger.error('error checking for JQuery on page ', state.pageUrl);
                    return RSVP.Promise.reject(err);
                });
    },

    _jqueryEvaluatorFunc: function() {
        return JQuery;
    }

    _includeJQueryDecisor: function(page, jquery) {
        
        if(!jquery) {

            logger.info('Including JQuery... JQuery not found on the page ', state.pageUrl);

            // load jquery in the page
            return page.includeJs(JQUERY_SCRIPT_LOCATION)
                .then(
                    function() {
                        logger.info('script ' + JQUERY_SCRIPT_LOCATION + ' included on page' + state.pageUrl);
                        return RSVP.Promise.resolve();
                    }
                    // error
                    , function(err) {
                        logger.error('error including JQuery ', state.pageUrl);
                        return RSVP.Promise.reject(err);  
                    });
        } else {

            logger.info('jquery already included on the webpage ', state.pageUrl);
            return RSVP.Promise.resolve();
        }
    }
});

module.exports = loadScriptProcessor;
