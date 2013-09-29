
var urlModule = require('url');
var pagesConfig = require('./selectorsConfiguration');
var selector = require('./WebSiteSelectorConfiguration');


module.exports = {

    /**
     * Returns a selector object to get specific elements on the page
     * @param url {String} the page url
     * @returns {selectorEnumerable} a future object with the configuration
     */
    create: function(url) {

        var hostname = urlModule.parse(url).hostname;

        var hostnameSelectors = pagesConfig[hostname];
        var applyToAll = pagesConfig.all;

        // selector enumerator
        return new selectorEnumerable(applyToAll, configuration);
    }

};