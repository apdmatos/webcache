var phantomPool         = require('../infrastructure/phantomJsProcessPool') ,
    webAssetsClient     = require('../infrastructure/webAssetsClient')      ,
    crawlerDecisor      = require('../infrastructure/crawlDecisor')         ;
    downloadDispatcher  = require('../infrastructure/dispatcher')           ,
    store               = require('../store/filesystem/filestore')          ,
    config              = require('../config')                              ,
    factory             = require('../processor/factory/processorFactory')  ,
    processorData       = require('../processor/data/processorData')        ,
    utils               = require('../util')                                ,
    RSVP                = require('rsvp')                                   ,
    logger              = require('../logger')                              ;


if (process.argv.length <= 2) {
    console.log("\n\
    usage: node cmdBinder <website> [<website>]* \n\
           node cmdBinder http://imgur.com/ http://twitter.com\n\
    ");

    process.exit(1);
}

// read parameters
var urls = [ ];
for (var i = 2, len = process.argv.length; i < len; ++i) {
    urls.push(process.argv[i]);
};

// urls = [
//     'http://www.abola.pt/',
//     'http://www.sapo.pt/',
//     'http://www.record.xl.pt/',
//     'http://news.ycombinator.com/',
//     'https://www.google.pt/',
//     'http://linkedin.com/',
//     'http://www.ebay.co.uk/',
//     'https://www.amazon.co.uk/',
//     'https://github.com/apdmatos',
//     'http://dioguinho.pt/'
// ];

logger.info('wiring dependencies...');

var store       = new store(config)                                         ,
    request     = new webAssetsClient(config.httpRequests.timeout)          ,
    processor   = factory(config.defaultProcessorConfig, store, request)    ,
    phantomPool = new phantomPool(
                      config.phantomJSProcessPool.maxSize
                    , config.phantomJSProcessPool.maxRetries
                    , config.phantomJSProcessPool.poolWatingTimeout)        ,
    decisor     = new crawlerDecisor(config.basePath)                       ,
    dispatcher  = new downloadDispatcher(phantomPool, processor, decisor)   ;

var promises = [];
for(var i = 0, len = urls.length; i < len; ++i) {
    var url = urls[i];

    logger.info('generating state data to process the url ', url);
    var promise = dispatcher.dispatch(url);
    
    promises.push(promise);
}

RSVP.allSettled(promises)
    .then(function(results) {

        // if(error) {
        //     logger.error('error downloading a webpage.', error);
        // }else {
        //     logger.info('webpages downloaded successfully');
        // }

        logger.info('cleanning up all processes');
        logger.info('destroying phantom pool');
        phantomPool.destroy();

        logger.info('all processes successfully destroyed');
    });