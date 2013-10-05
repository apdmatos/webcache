
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
    }
});


module.exports = WebSiteSelectorConfiguration;