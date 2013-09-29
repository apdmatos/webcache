
var processor = require('./processor');
var urlMod = require('url');
var util = require('util');

function absoluteUriProcessor() {
    // call base constructor
    processor.apply(this, arguments);

}



util.inherit(absoluteUriProcessor, processor);

absoluteUriProcessor.prototype = {

    process: function(url, store, engine, page, state, done) {

        // base.process
        processor.prototype.process.apply(this, arguments);

        var absolutePathElements = this.selectorConfig && this.selectorConfig.download && this.selectorConfig.download.absolutePath;
        if(absolutePathElements) {
            for(var tag in absolutePathElements) {

            }
        }
    }


};


var toAbsolutePath = {

    a: function(elem) {

    },

    img: function(elem) {

    },

    script: function(elem) {

    },

    link: function(elem) {

    },

    embed: function(elem) {

    }
};

module.exports = absoluteUriProcessor;