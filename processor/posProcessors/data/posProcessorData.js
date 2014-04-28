



/**
 * constructor
 * PosProcessor data class
 * @param  {Processor} processor
 * @param  {ProcessorData} state
 */
function posProcessorData(processor, state, baseUrl, relPath, engine) {
    this.processor      = processor;
    this.processorState = state;
    this.baseUrl        = baseUrl;
    this.relPath        = relPath;
    this.engine         = engine;
}




/**
 * constructor
 * Processor data for regexPosProcessor
 * @param  {ElementDownloaderProcessor} processor
 * @param  {ProcessorData} state
 * @param  {String[]} regexps
 */
function regexPosProcessorData(processor, state, baseUrl, relPath, engine, regexps) {

    // call base constructor
    posProcessorData.call(this, processor, state, baseUrl, relPath, engine);

    // String[]
    this.regexps = regexps;
}
regexPosProcessorData.prototype = new posProcessorData;




/**************************************************************************************
 * ************************************************************************************
 *
 * Exports pos processor data types
 * ************************************************************************************
 * ************************************************************************************
 */
module.exports = {
    posProcessorData         : posProcessorData,
    regexPosProcessorData    : regexPosProcessorData
};