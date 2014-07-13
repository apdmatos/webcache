var storedata = require('./../../store/storedata');


/**
 * Represents the processor data object
 * @param  {[String]} pageUrl
 * @param  {storeData} storedata
 */
function processorData(pageUrl, storedata) {

    this.pageUrl = pageUrl;
    this.storedata = storedata;

}


module.exports = {

    /**
     * Factory method to create the processorData object
     * @param  {[type]} url [description]
     * @return {[type]}     [description]
     */
    create: function(url, location) {

        var storeData = new storedata(url, location);
        return new processorData(url, storeData);
    }

};