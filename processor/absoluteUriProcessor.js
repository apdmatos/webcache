

// Processor dependencies
var processor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function absoluteUriProcessor() {
    // call base constructor
    processor.apply(this, arguments);

}


util.inherits(absoluteUriProcessor, processor);

utils.extend(absoluteUriProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        // base.process
        var self = this;
        state = processor.prototype.process.apply(this, arguments);

        function processElements (config) {

            var evaluates = 0;

            var absolutePathElements = config && config.absolutePath;
            if(absolutePathElements) {
                for(var i = 0, len = absolutePathElements.length; i < len; ++i) {

                    var tag = absolutePathElements[i];

                    console.log('searching for: ' + tag + ' elements');

                    ++ evaluates;

                    page.evaluate(
                        phantomFunc(processTagElements, [url, tag]),
                        function(err, res) {
                            if(err) console.log('error including jquery... ', err);
                            else console.log('tag: ' + res.tag + ' length: ' + res.length);

                            if(--evaluates == 0) self.next(url, engine, page, state, done);

                        });

                }
            }
        }

        var config = state.websiteconfig.getConfiguration();
        if(!config) 
            state.websiteconfig.on('set:config', processElements);
        else 
            processElements(config);
    }


});



// All the function definition MUST stay together. 
// That's the only way to send the code to be executed on the browser, via phantomJS
// See: node-phantom-extensions/parameterFunction
var processTagElements = function (url, tag) {
    return function() {

        function rel_to_abs(url){
            /* Only accept commonly trusted protocols:
             * Only data-image URLs are accepted, Exotic flavours (escaped slash,
             * html-entitied characters) are not supported to keep the function fast */
          if(/^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url))
                 return url; //Url is already absolute

            var base_url = location.href.match(/^(.+)\/?(?:#.+)?$/)[0]+"/";
            if(url.substring(0,2) == "//")
                return location.protocol + url;
            else if(url.charAt(0) == "/")
                return location.protocol + "//" + location.host + url;
            else if(url.substring(0,2) == "./")
                url = "." + url;
            else if(/^\s*$/.test(url))
                return ""; //Empty = Return nothing
            else url = "../" + url;

            url = base_url + url;
            var i=0
            while(/\/\.\.\//.test(url = url.replace(/[^\/]+\/+\.\.\//g,"")));

            /* Escape certain characters to prevent XSS */
            url = url.replace(/\.$/,"").replace(/\/\./g,"").replace(/"/g,"%22")
                    .replace(/'/g,"%27").replace(/</g,"%3C").replace(/>/g,"%3E");
            return url;
        }

        var toAbsolutePath = {
            replaceUrl: function(url, elem, attrName) {
                var relUrl = elem.attr(attrName);
                //var absoluteUrl = urlMod.resolve(url, relUrl);
                var absoluteUrl = rel_to_abs(relUrl);

                console.log('adding url: ' + absoluteUrl);

                elem.attr(attrName, absoluteUrl);
            },

            a: function(url, elem) {

                this.replaceUrl(url, elem, 'href');
            },

            img: function(url, elem) {

                this.replaceUrl(url, elem, 'src');
            },

            script: function(url, elem) {

                this.replaceUrl(url, elem, 'src');
            },

            link: function(url, elem) {

                this.replaceUrl(url, elem, 'href');
            },

            embed: function(url, elem) {

                this.replaceUrl(url, elem, 'src');
            }
        };

        var elements = $(tag);
        console.log('found ' + elements.length + ' ' + tag + ' elements');

        elements.each(function() {

            toAbsolutePath[tag](url, $(this));

        });

        return {
            length: elements.length,
            tag: tag
        };
    }()
}



// exports the processor
module.exports = absoluteUriProcessor;


