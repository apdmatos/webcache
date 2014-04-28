

/**
 * Constructor for the posProcessor type
 * @param  {[type]} processor
 * @return {[type]}
 */
function posProcessor() { }
posProcessor.prototype = {

    /**
     * Process data file
     * @param  {String}   file
     * @param  {RegexPosProcessorData}   posProcessorData
     * @param  {Function} done - to be called when done
     * @return {void}
     */
    process: function(file, posProcessorData, done) {
        /* Must be implemented by each specific class */
    }

};


/**
 * Exports the posProcessor base class
 * @type {PosProcessor}
 */
module.exports = posProcessor;