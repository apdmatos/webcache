



var engine = require('./engine');
var pageSelector = require('./pageSelectors/pageSelectors');
var store = require('./store/filestore');

// processors
var loadScriptProcessor = require('./processor/loadScriptProcessor');
var previewProcessor = require('./processor/previewProcessor');
var absoluteUriProcessor = require('./processor/absoluteUriProcessor');
var htmlDownloaderProcessor = require('./processor/htmlDownloaderProcessor');


var config = require('./config');



var urls = [
    "http://www.google.pt"
];


var store = new store(config);

var processor = new loadScriptProcessor(
    new previewProcessor(
    	new absoluteUriProcessor(
	        new htmlDownloaderProcessor(null, store),
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
