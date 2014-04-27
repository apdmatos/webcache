var utils = require('./../util');


module.exports = function(url, location) {
    this.url = url;
    this.location = location;
    this.created = false;
};


module.exports.prototype = {

    toString: function() {

        return "url: " + this.url +
            "\location: " + this.location;
    }

}