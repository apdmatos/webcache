

var storedata = require('./../store/storedata');

function processorData(storedata) {

    this.storedata = storedata;

}


module.exports = {

    create: function(url) {

        var storeData = new storedata(url);
        return new processorData(storeData);
    }

};