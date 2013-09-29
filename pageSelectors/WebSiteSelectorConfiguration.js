

/**
 * object that contains all the selectors to be applied to each loaded page
 * @param obj [Array{Object}]
 */
function WebSiteSelectorConfiguration(obj) {


    var selectors = obj;
    for(var i = 1, len = arguments.length; i < len; ++i)
        selectors = selectors.concat(arguments[i]);


    this.selectors = selectors;
    this.index = 0;

}


WebSiteSelectorConfiguration.prototype = {

    /**
     * Returns the next css selector
     * @returns {String} the css selector on the page
     */
    getNext: function() {
        return this.selectors[this.index++]
    },

    /**
     * Checks if there is more selectors to be applied
     * @returns {boolean}
     */
    hasNext: function() {
        return this.index < this.selectors.length;
    },

    /**
     * Resets the enumaration
     */
    reset: function() {
        this.index = 0;
    }
}


module.exports = WebSiteSelectorConfiguration;