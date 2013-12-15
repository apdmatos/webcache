
// dependencies
var engine 			= require('../engine')								,
	pageSelector 	= require('../pageSelectors/pageSelectors')			,
	store 			= require('../store/filestore')						,
	config 			= require('../config')								,
	factory			= require('../processor/factory/processorFactory')	,
	utils			= require('../util')								;



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

var store 		= new store(config)								,
	processor 	= factory(config.defaultProcessorConfig, store)	,
	eng 		= new engine(processor)							;

// create a waitFunction to wait for all the callbacks
var waitFn = utils.waitForCallbacks(function() {
	process.exit(1);
}, this);

for(var i = 0, len = urls.length; i < len; ++i) {
    eng.load(urls[i], waitFn);
}