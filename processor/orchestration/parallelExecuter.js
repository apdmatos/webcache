
var baseProcessor   = require('../processor')   ,
    RSVP            = require('rsvp')           ,
    util            = require('util')           ,
    utils           = require('../../util')     ,
    logger          = require('../../logger')   ,
    _               = require('underscore')     ;

/**
 * this is a special processor that allows the execution of multiple processors at the same time
 * 
 *            |---- p1 ----- |
 *      p0---- ---- p2 -----  ----- p4
 *            |---- p3 ----- | 
 *            
 * @param  {[Processor]} nextProcessor
 * @param  {[Store]} store
 * @param  {[Processor]} processors The processors to be executed on parallel
 */
function parallelExecutor(nextProcessor, store, processors) {

    baseProcessor.apply(this, [nextProcessor, store]);
    this.processors = processors;

}
util.inherits(parallelExecutor, baseProcessor);

utils.extend(parallelExecutor.prototype, {

    /**
     * Executes the processors in parallel collecting the processor results
     * @param  {[PantomPage]}       page
     * @param  {[ProcessorData]}    state
     * @return {Promise[ProcessorData]}
     */
    process: function(page, state) {

        baseProcessor.prototype.process.apply(this, arguments);

        logger.info('parallel executor processor execution to process url ' + state.pageUrl);

        // base.process
        var self = this;
        var promises = [];
        for (var i = 0, len = this.processors.length; i < len; ++i) {

            var processor = this.processors[i];

            // call the processor
            var promise = processor.process(page, state);
            promises.push(promise);
        }

        // execute processors in parallel, synhronizing the result
        return RSVP.allSettled(promises)
            .then(function(results) {

                var rejected = _.where(results, { state: 'rejected' });
                if(rejected.length > 0) {
                    var mappedErros = _.map(rejected, function(num, key){ return rejected[key].reason; });
                    return RSVP.Promise.reject(mappedErros);
                }

                return self.next(page, state);
            });
    }

});


module.exports = parallelExecutor;

