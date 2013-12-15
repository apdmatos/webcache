
// dependencies
var engine 			= require('../engine')								,
	pageSelector 	= require('../pageSelectors/pageSelectors')			,
	store 			= require('../store/filestore')						,
	config 			= require('../config')								,
	factory			= require('../processor/factory/processorFactory')	,
	utils			= require('../util')								;


var store 		= new store(config)								,
	processor 	= factory(config.defaultProcessorConfig, store)	,
	eng 		= new engine(processor)							;

var urls = [
    "http://pplware.sapo.pt/"
];

var waitFn = utils.waitForCallbacks(function() {
	process.exit(1);
}, this);

for(var i = 0, len = urls.length; i < len; ++i) {
    eng.load(urls[i], waitFn);
}