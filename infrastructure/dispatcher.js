
var logger          = require('../logger'),
    processorData   = require('../processor/data/processorData'),
    utils           = require('../util');


var DEFAULT_LIMIT = 10;

/**
 * The dispatcher that wiresup dependencies between processors and the phantomJsProcessPool
 * handling a storage to keep the temporary pages to be downloaded
 * @param  {DownloadPageStore} store the store to keep temporary pages to be downloaded
 * @param  {int} limit the limit of parallel processors in execution
 */
function dispatcher(phantomPool, processor, crawlerDecisor, store, limit) {
    this.phantomPool = phantomPool;
    this.processor = processor;
    this.crawlerDecisor = crawlerDecisor;
    this.store = store;
    this.limit = limit || DEFAULT_LIMIT;
}

dispatcher.prototype = {

    dispatch: function(url) {
        var self = this;
        logger.info('generating state data to process the url ', url);
        var promise = this.crawlerDecisor.generatePageLocation(url)
            .then(function(location) {

                logger.info('url ' + url + ' is being processed and the page data will be stored at ' + location);

                var state = processorData.create(url, location);
                var executeProcessor = utils.callbackWrapper(self._executeProcessor, self, [state]);
                return self.phantomPool.process(url, executeProcessor);
            });

            // update datastore with this information...


        return promise;
    },

    _executeProcessor: function(phantomPage, state) {
        return this.processor.process(state, phantomPage);
    }

};


module.exports = dispatcher;