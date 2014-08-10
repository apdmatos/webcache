var baseProcessor   = require('./processor')                                    ,
    util            = require('util')                                           ,
    utils           = require('./../util')                                      ,
    phantomFunc     = require('../node-phantom-extensions/parameterFunction')   ,
    RSVP            = require('rsvp')                                           ,
    logger          = require('../logger')                                      ,
    _               = require('underscore')                                     ;

var toAbsolutePathElements = [
    'a', 'img', 'script', 'link', 'embed'
];

/**
 * Converts all the links on the page to an absolute URL
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 */
function absoluteUriProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

}

util.inherits(absoluteUriProcessor, baseProcessor);
utils.extend(absoluteUriProcessor.prototype, {

    /**
     * Gets all relative urls from the page and changes it to an absolute url
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return {Promise[ProcessorData]}
     */
    process: function(page, state) {
        console.log('absolute uri processor...');

        // base.process
        var self = this;
        baseProcessor.prototype.process.apply(this, arguments);

        function processElement (tag) {

            return page.evaluate( phantomFunc(processTagElements, [state.pageUrl, tag]) )
                .then(function(res) {
                    if(res) {
                        logger.info('tag: ' + res.tag + ' length: ' + res.length);
                    } else {
                        logger.warn('tag: ' + tag + ' return a null result');
                    }
                });
        }

        var promises = [];
        for (var i = 0, len = toAbsolutePathElements.length; i < len; ++i) {
            var element = toAbsolutePathElements[i];
            var promise = processElement(element);
            promises.push(promise);
        }

        return RSVP.allSettled(promises)
            .then(function(results) {

                var rejected = _.where(results, { state: 'rejected' });
                if(rejected.length > 0) {

                    logger.error('toAbsolute url completed with errors...')

                    var mappedErros = _.map(rejected, function(num, key){ return rejected[key].reason; });
                    return RSVP.Promise.reject(mappedErros);
                }

                logger.info('toAbsolute url processor completed successfully');
                return self.next(page, state);
            });
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
            //while(/\/\.\.\//.test(url = url.replace(/[^\/]+\/+\.\.\//g,"")));

            /* Escape certain characters to prevent XSS */
            url = url.replace(/\.$/,"").replace(/\/\./g,"").replace(/"/g,"%22")
                    .replace(/'/g,"%27").replace(/</g,"%3C").replace(/>/g,"%3E");
            return url;
        }

        var toAbsolutePath = {
            replaceUrl: function(url, elem, attrName) {
                var relUrl = elem.attr(attrName);

                // we will only do the replacement if the script tag contains 
                // the scr attribute
                if(relUrl) {
                    var absoluteUrl = rel_to_abs(relUrl);
                    console.log('adding url: ' + absoluteUrl);
                    elem.attr(attrName, absoluteUrl);
                }
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