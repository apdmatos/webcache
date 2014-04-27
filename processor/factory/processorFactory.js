var loadScriptProcessor 	= require('../loadScriptProcessor')					,
	previewProcessor 		= require('../previewProcessor')					,
	absoluteUriProcessor 	= require('../absoluteUriProcessor')				,
	imgProcessor 			= require('../imgProcessor')						,
	cssProcessor 			= require('../cssProcessor')						,
	jsProcessor 			= require('../jsProcessor')							,
	htmlCrawlProcessor 		= require('../htmlCrawlProcessor')					,
	htmlDownloaderProcessor = require('../htmlDownloaderProcessor')				,
	parallelProcessor		= require('../orchestration/parallelExecuter')		,
	regexPosProcessor 		= require('../../posProcessors/regexPosProcessor')	,
	utils 					= require('../../util')								;


/**
 * Helper function to get the factory method name and parameters
 * @param  {string | Object} processorItem The item containing the processor data to create
 * @return {Object}  An object with the following structure
 *  {
 *  	key: {string},
 *  	parameters: {Object}
 *  }
 */
var getProcessorNameAndParameters = function(processorItem) {
	if(typeof(processorItem) === "string") {
		return 	{
			key: processorItem,
			parameters: null
		}
	}

	// is an object... Just get the first key and get the parameters
	var key = utils.getFirstKey(processorItem);
	return {
		key: key,
		parameters: processorItem[key]
	}
}

/**
 * The factory methods to create the processors
 * @type {Object}
 */
var factories = {

	/**
	 * Creates a parallel processor
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	parallel: function(next, store, state) {
		
		var processors = [],
			processorParams,
			processorFunc,
			processor;

		for (var i = 0; i < state.length; ++i) {
			var processorParams = getProcessorNameAndParameters(state[i]);
			var processorFunc = factories[processorParams.key];
			var processor = processorFunc(null, store, processorParams.parameters)

			processors.push(processor);
		}

		return new parallelProcessor(next, store, processors);
	},

	/**
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	img: function(next, store, state) {
		return new imgProcessor(next, store);
	},

	/**
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	css: function(next, store, state) {
		var posProcessor = new regexPosProcessor([
		    new imgProcessor(null, store),
		    new cssProcessor(null, store),
		    new jsProcessor (null, store)
		]);
		return new cssProcessor(next, store, posProcessor);
	},

	/**
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	js: function(next, store, state) {
		return new jsProcessor(next, store);
	},

	/**
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	absoluteurl: function(next, store, state) {
		return new absoluteUriProcessor(next, store);
	},

	/**
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	preview: function(next, store, state) {
		return new previewProcessor(next, store);
	},

	/**
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	loadscript: function(next, store, state) {
		return new loadScriptProcessor(next, store);
	},

	/**
	 * @param  {Processor} next  The next processor
	 * @param  {Store}   store 
	 * @param  {Object[]}  state to create the processors to be executed in parallel
	 * @return {Processor}
	 */
	downloader: function(next, store, state) {
		return new htmlDownloaderProcessor(next, store);
	}
};


/**
 * 
 * @param  {Object[]} structure An array describing how the processors are composed
 *   [
 *       { 
 *           parallel: ['loadscript', 'preview']
 *       },
 *       {
 *           parallel: ['img', 'css', 'js', 'absoluteurl']  
 *       },
 *       'downloader'
 *   ]
 * @param  {Store} 			 store     to save pages into
 * @return {Processor}       A processor
 */
module.exports = function(processorStructure, store) {

    var processorElement,
    	factoryFunc,
    	lastProcessor = null;
    for (var i = processorStructure.length - 1; i >= 0; --i) {
    	
    	processorElement = getProcessorNameAndParameters(processorStructure[i]);
    	factoryFunc = factories[processorElement.key];
    	lastProcessor = factoryFunc(lastProcessor, store, processorElement.parameters);
    }

    return lastProcessor;
};