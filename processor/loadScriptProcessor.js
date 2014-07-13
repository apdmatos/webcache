
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


        return new RSVP.Promise(function(resolve, reject) {

            //var callback = utils.callbackWrapper(this.next, this, [url, engine, page, state, done]);
            page.evaluate(function () {
                return JQuery;
            }, function(err, jquery){

                if(err) {
                    logger.error('error checking for JQuery on page ', state.pageUrl);
                    return reject(err);
                }

                if(!jquery) {

                    logger.info('Including JQuery... JQuery not found on the page ', state.pageUrl);

                    // load jquery in the page
                    page.includeJs(JQUERY_SCRIPT_LOCATION, function(e) {
                        
                        if(e) {
                            logger.error('error including JQuery ', state.pageUrl);
                            return reject(e);
                        }

                        logger.info('script ' + JQUERY_SCRIPT_LOCATION + ' included on page' + state.pageUrl);
                        resolve();

                    });
                } else {

                    logger.info('jquery already included on the webpage ', state.pageUrl);
                    resolve();
                }
                
            });
        });
    }
});

module.exports = loadScriptProcessor;
