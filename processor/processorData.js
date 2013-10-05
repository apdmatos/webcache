

var storedata = require('./../store/storedata');
var selectors = require('./../pageSelectors/pageSelectors');


function processorData(storedata, websiteConfig) {

    this.storedata = storedata;
    this.websiteconfig = websiteConfig;

}


module.exports = {

    create: function(url) {

        var storeData = new storedata(url);
        var websiteConfig = selectors.create(url);



        return new processorData(storeData, websiteConfig);
    }

};