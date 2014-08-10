
var config = {

    /**
     *  The base path to store website information
     *  {String}
     */
    basePath: '/Users/apdmatos/data',

    /**
     * The website preview image file name
     * {String}
     */
    previewWebsiteFile: 'preview.png',

    /**
     * the main html file name
     */
    htmlFile: 'index.html',

    /**
     * The website files, where js, css and html files will be contained
     * {String}
     */
    websiteFiles: 'files',

    /**
     * the location for image files
     * {String}
     */
    imageFiles: 'images',

    /**
     * location for css files
     * {String}
     */
    cssFiles: 'css',

    /**
     * location for js files
     *
     */
    jsFiles: 'js',

    /**
     * The default configuration for processors
     * How they are disposed and the dependencies 
     * between them are described here
     * @type {Object}
     */
    defaultProcessorConfig: [
        { 
            parallel: ['loadscript', 'preview']
        },
        {
            parallel: ['img', 'css', 'js', 'absoluteurl']
        },
        'downloader'
    ],

    /**
     * Configurations for phantom js process pool
     * @type {Object}
     */
    phantomJSProcessPool: {

        /**
         * The max pool size
         * @type {Number}
         */
        maxSize: 1,

        /**
         * In case of an error how many times the open page will be retried
         * @type {Number}
         */
        maxRetries: 1,

        /**
         * The process waiting timeout on the pool to be processed
         * @type {Number}
         */
        poolWatingTimeout: 10000
    },

    /**
     * configuration for http requests
     * @type {Object}
     */
    httpRequests: {
        /**
         * timeout for http requests
         * @type {Number}
         */
        timeout: 10000
    },

    dispatcher: {

        parallelExecutors: 10

    }

};

if(module && module.exports)
    module.exports = config;