var urlMod  = require('url')            ,
    utils   = require('./../util')      ,
    path    = require('path')           ,
    fs      = require('fs')             ,
    logger  = require('../../logger')   ,
    RSVP    = require('rsvp')           ;

/**
 * Constructor
 * @param  {Object} config the base configuration
 */
function filestore(config) {
    this.config = config;
}

filestore.prototype = {

    /**
     * Saves the page preview on disk
     * @param   {Buffer}      buffer
     * @param   {StoreData}   storedata The state for store
     * @returns {Promise}
     */
    saveWebsitePreview: function(buffer, storedata) {
        logger.info('saving website preview.', storedata.toString());
        return privateFuncs.saveFile(
            this.config,
            storedata, 
            null, 
            this.config.previewWebsiteFile, 
            buffer, 
            'binary'
        );
    },

    /**
     * Saves the page HTML on disk
     * @param  {String}      html
     * @param  {StoreData}   storedata The state for store
     * @returns {Promise}
     */
    saveHtmlPage: function(html, storedata, done) {
        logger.info('saving html page.', storedata.toString());
        return privateFuncs.saveFile(
            this.config, 
            storedata, 
            null, 
            this.config.htmlFile, 
            html, 
            'utf8'
        );
    },

    /**
     * Saves the page HTML on disk
     * @param  {Buffer}      buffer
     * @param  {StoreData}   storedata The state for store
     * @param  {filename}    filename  the name for the file on disk
     * @returns {Promise}
     */
    saveImage: function(buffer, storedata, filename) {
        logger.info('saving image with name ', fileName, storedata.toString());
        return privateFuncs.saveFile(
            this.config, 
            storedata, 
            this.getImagesRelativePath(), 
            filename, 
            buffer, 
            'binary'
        );
    },

    /**
     * Saves the css on disk
     * @param  {String}      buffer
     * @param  {StoreData}   storedata The state for store
     * @param  {filename}    filename  the name for the file on disk
     * @returns {Promise}
     */
    saveCss: function(buffer, storedata, filename) {
        logger.info('saving css file ', fileName, storedata.toString());
        return privateFuncs.saveFile(
            this.config, 
            storedata, 
            this.getCSSRelativePath(), 
            filename, 
            buffer, 
            'utf8'
        );
    },

    /**
     * Saves the js on disk
     * @param  {String}      buffer
     * @param  {StoreData}   storedata The state for store
     * @param  {filename}    filename  the name for the file on disk
     * @returns {Promise}
     */
    saveJs: function(buffer, storedata, filename) {
        logger.info('saving js file ', fileName, storedata.toString());
        return privateFuncs.saveFile(
            this.config, 
            storedata, 
            this.getJSRelativePath(), 
            filename, 
            buffer, 
            'utf8',
            done
        );
    },

    /**
     * Returns a relative path to save images on disk
     * @return {String}
     */
    getImagesRelativePath: function() {
        return this.config.imageFiles;
    },

    /**
     * Returns a relative path to save css files on disk
     * @return {String} [description]
     */
    getCSSRelativePath: function() {
        return this.config.cssFiles;
    },

    /**
     * Returns a relative path to save js files on disk
     * @return {String} [description]
     */
    getJSRelativePath: function() {
        return this.config.jsFiles;
    }

};



/**
 * Object that holds the private method which should not be exposed on the public interface.
 * @type {Object: Function}
 */
var privateFuncs = {

    /**
     * Saves a file on the file system
     * @param  {[type]} config               [description]
     * @param  {[type]} storedata            [description]
     * @param  {[type]} containingFolderPath [description]
     * @param  {[type]} fileName             [description]
     * @param  {[type]} data                 [description]
     * @param  {[type]} format               [description]
     * @param  {[type]} doneFunc             [description]
     * @return {[type]}                      [description]
     */
    saveFile: function(config, storedata, containingFolderPath, fileName, data, format, doneFunc) {

        this.getDirectoryPath(config, storedata, function(dirPath) {
            // save image file
            containingFolderPath = containingFolderPath || '';
            var containingDir = path.join(dirPath, containingFolderPath);
            
            // create a containing folder, if necessary (/css, /images and /js)
            utils.createDirIfDoesNotExist(containingDir, function() {
                
                var filePath = path.join(containingDir, fileName);
                console.log('storing file in ' + filePath);
                fs.writeFile(filePath, data, format, doneFunc);

            });
        });
    },

    createDirectoryHierarchy: function() {
        // TODO: ...
    },

    /**
     * [getDirectoryPath description]
     * @param  {[type]}   config    [description]
     * @param  {[type]}   storedata [description]
     * @param  {Function} done      [description]
     * @return {[type]}             [description]
     */
    getDirectoryPath: function(config, storedata, done) {
        if(!storedata.dirPath) {

            // create the base website directory
            var hostname = urlMod.parse(storedata.url).hostname;
            var dir = path.join(config.basePath, hostname);

            utils.createDirIfDoesNotExist(dir, function() {

                if(storedata.dirPath) {
                    done(storedata.dirPath);
                    return;
                }

                dir = path.join(dir, storedata.guid);

                utils.createDirIfDoesNotExist(dir, function() {
                    if(!storedata.dirPath) storedata.dirPath = dir;

                    done(storedata.dirPath);

                });

            });
        }else {
            done(storedata.dirPath);
        }
    }
};





module.exports = filestore;