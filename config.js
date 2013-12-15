


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
    ]

};



if(module && module.exports)
	module.exports = config;