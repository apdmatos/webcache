

var utils = require('./../util');


module.exports = function(url) {

    this.url = url;

    this.dirPath;

    this.relativePath;

    this.guid = utils.newGuid();
};


module.exports.prototype = {

    toString: function() {

        return "url: " + this.url +
            "\ndirPath: " + this.dirPath +
            "\nrelativePath: " + this.relativePath +
            "\nguid: " + this.guid;
    }

}