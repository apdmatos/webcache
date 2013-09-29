
var processor = require('./url');

var factory = function(storeFactory) {
    this.storeFactory = storeFactory;
}

factory.prototype = {

    create: function(url) {
        var store = this.storeFactory.getStore(url);
        return new processor(url, store);
    }
};

module.exports = factory;