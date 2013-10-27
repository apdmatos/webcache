

// Processor dependencies
var baseProcessor = require('./processor');
var urlMod = require('url');
var util = require('util');
var utils = require('./../util');
var phantomFunc = require('../node-phantom-extensions/parameterFunction')



// processor constructor
function htmlCrawlProcessor(nextProcessor, store) {
    // call base constructor
    baseProcessor.apply(this, [nextProcessor, store]);

}


util.inherits(htmlCrawlProcessor, baseProcessor);

utils.extend(htmlCrawlProcessor.prototype, {

    process: function(url, engine, page, state, done) {

        console.log('css processor...');
        var self = this;
        state = baseProcessor.prototype.process.apply(this, arguments);
        
        self.next(url, engine, page, state, done);
    }


});




// exports the processor
module.exports = htmlCrawlProcessor;








