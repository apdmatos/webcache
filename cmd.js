



var engine = require('./engine');
var pageSelector = require('./pageSelectors/pageSelectors');
var store = require('./store/filestore');

// processors
var loadScriptProcessor = require('./processor/loadScriptProcessor');
var previewProcessor = require('./processor/previewProcessor');
var absoluteUriProcessor = require('./processor/absoluteUriProcessor');
var imgProcessor = require('./processor/imgProcessor');
var cssProcessor = require('./processor/cssProcessor');
var jsProcessor = require('./processor/jsProcessor');
var htmlCrawlProcessor = require('./processor/htmlCrawlProcessor');
var htmlDownloaderProcessor = require('./processor/htmlDownloaderProcessor');
var regexPosProcessor = require('./posProcessors/regexPosProcessor');


var config = require('./config');



var urls = [
    //"http://www.google.pt"
    "http://pplware.sapo.pt/"
];


var store = new store(config);



var posProcessor = new regexPosProcessor([
    new imgProcessor(null, store),
    new cssProcessor(null, store),
    new jsProcessor (null, store)
]);

var processor = new loadScriptProcessor(
    new previewProcessor(
    	new absoluteUriProcessor(
            new imgProcessor(
                new cssProcessor(
                    new jsProcessor(
                        new htmlCrawlProcessor(
                            new htmlDownloaderProcessor(null, store),
                            store
                        ),
                        store
                    ),
                    store,
                    posProcessor
                ),
                store
            ),
	        store
	    ),
	    store
    ), 
store);


var eng = new engine(processor);

var requests = 0;
for(var i = 0, len = urls.length; i < len; ++i)
{
    ++requests;
    eng.load(urls[i], function() {
        if(--requests == 0) process.exit(1);
    });
}
