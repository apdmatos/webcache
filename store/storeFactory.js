


var filestore = require('./filestore');

function storeFactory(config) {

    this.config = config;
}

storeFactory.prototype = {

    getStore: function(url) {

        return new filestore(this.config, url);

    }


};


module.exports = storeFactory;