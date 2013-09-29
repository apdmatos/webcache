var utils = require('./../util');
var processorData = require('./processorData');


function processor(nextProcessor, store, webSiteSelectorConfiguration) {

    this.nextProcessor = nextProcessor;
    this.store = store;
    this.selectorConfig = this.webSiteSelectorConfiguration;
}


utils.extend(processor.prototype, {

    process: function(url, engine, page, state, done) {

        if (!state) {

            state = new processorData.create(url);

        }

        return state;
    },

    next: function(url, engine, page, state, done) {
        if(this.nextProcessor) {
            this.nextProcessor.process(url, engine, page, state, done);
        }else {
            done();
        }
    }
});


module.exports = processor;