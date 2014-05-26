var phantomPool     = require('../infrastructure/phantomJsProcessPool') ,
    webAssetsClient = require('../infrastructure/webAssetsClient')      ,
    crawlerDecisor  = request('../infrastructure/crawlerDecisor')       ,
    store           = require('../store/filesystem/filestore')          ,
    config          = require('../config')                              ,
    factory         = require('../processor/factory/processorFactory')  ,
    processorData   = require('../processor/data/processorData')        ,
    utils           = require('../util')                                ,
    RSVP            = request('rsvp')                                   ,
    logger          = request('./logger')                               ;



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

logger.info('wiring dependencies...');

var store       = new store(config)                                         ,
    request     = new webAssetsClient(config.httpRequests.timeout)          ,
    processor   = factory(config.defaultProcessorConfig, store)             ,
    phantomPool = new phantomPool(
                      config.phantomJSProcessPool.maxPoolSize
                    , config.phantomJSProcessPool.poolWatingTimeout)        ,
    decisor     = new crawlerDecisor(config.basePath)                       ;

var promises = [];
for(var i = 0, len = urls.length; i < len; ++i) {
    var url = urls[i];

    logger.info('generating state data to process the url ', url);
    var promise = decisor.generatePageLocation(url)
        .then(function(location) {
            var state = processorData.create(url, location);
            return phantomPool.execute(processor);
        });

    promises.push(promise);
}

RSVP.all(promises)
    .then(function(result, error) {
        if(error) {
            logger.error('error downloading a webpage.', error);
        }else {

            // TODO: how to handle multiple results with promises?

            logger.info('webpages downloaded successfully');
        }
    })
    .catch(function(reason) {
        logger.error('error downloading a webpage. An exception occurred', reason);
    })
    .finally(function() {
        logger.trace('cleanning up all processes');

        logger.trace('destroying phantom pool');
        phantomPool.destroy();

        logger.trace('all processes successfully destroyed');
    });