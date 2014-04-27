

// dependencies
var storedata = require('./../store/storedata')                ,
	selectors = require('./../pageSelectors/pageSelectors')    ;


/**
 * Represents the processor data object
 * @param  {[type]} storedata
 * @param  {[type]} websiteConfig
 */
function processorData(storedata, websiteConfig) {

    this.storedata = storedata;
    this.websiteconfig = websiteConfig;

}


module.exports = {

	/**
	 * Factory method to create the processorData object
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
    create: function(url) {

        var storeData = new storedata(url);
        var websiteConfig = selectors.create(url);

        return new processorData(storeData, websiteConfig);
    }

};