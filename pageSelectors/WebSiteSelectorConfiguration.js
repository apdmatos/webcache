
var util    = require('util'),
    events  = require('events'),
    utils   = require('../util');


/**
 * object that contains all the selectors to be applied to each loaded page
 * @param obj [Array{Object}]
 */
function WebSiteSelectorConfiguration(config) {


    this.config = config;

}


util.inherits(WebSiteSelectorConfiguration, events.EventEmitter);

utils.extend(WebSiteSelectorConfiguration.prototype, {

    getConfiguration: function() {
        return this.config;
    },

    setConfiguration: function(config) {
        this.config = config;
        this.emit('set:config', config);
    },

    downloadElement: function(elementName) {
        var htmlElements; 
        if (this.config.download && htmlElements = this.config.download.htmlElements) {

            var elem;
            for(var i = 0, len = htmlElements.length; i < len; ++i) {
                elem = htmlElements[i];
                
                if(elem === elementName) return true;
            }


        }

        return false;
    }
});


module.exports = WebSiteSelectorConfiguration;