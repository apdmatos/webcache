var urlMod  = require('url')                ,
    utils   = require('./../../util')       ,
    path    = require('path')               ,
    fs      = require('fs')                 ,
    logger  = require('../../logger')       ,
    RSVP    = require('rsvp')               ,
    mkpath  = require('mkpath')             ;

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
        logger.info('saving image with name ', filename, storedata.toString());
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
        logger.info('saving css file ', filename, storedata.toString());
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
        logger.info('saving js file ', filename, storedata.toString());
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
     * @return {Promise}                     [description]
     */
    saveFile: function(config, storedata, containingFolderPath, fileName, data, format) {
        var self = this;
        return new RSVP.Promise(function(resolve, reject) {
            self.getDirectoryPath(config, storedata, function(err, dirPath) {

                if(err) {
                    logger.error('error getting directory path ' + err);
                    return reject(err);
                }

                // save image file
                containingFolderPath = containingFolderPath || '';
                var containingDir = path.join(dirPath, containingFolderPath);
                
                // create a containing folder, if necessary (/css, /images and /js)
                self.createDirectoryIfNotExists(containingDir, function(err) {
                    if(err) {
                        logger.error('error creating directory ' + containingDir + ' ... Error: ' + err);
                        return reject(err);
                    }

                    var filePath = path.join(containingDir, fileName);
                    logger.info('storing file in ' + filePath);
                    fs.writeFile(filePath, data, format, function(err) {
                        if(err) {
                            logger.error('error writing file to fs... Error: ' + err);
                            return reject(err);
                        }

                        logger.info('stored file ', filePath);
                        resolve();
                    });
                });
            });
        });
    },

    /**
     * [getDirectoryPath description]
     * @param  {[type]}   config    [description]
     * @param  {[type]}   storedata [description]
     * @param  {Function} done      [description]
     * @return {[type]}             [description]
     */
    getDirectoryPath: function(config, storedata, done) {
        if(storedata.created) {
            done(null, storedata.location);
        }

        this.createDirectoryIfNotExists(storedata.location, function(err) {
            storedata.created = true;
            done(err, storedata.location)
        });
    },

    createDirectoryIfNotExists: function(dir, done) {
        
        fs.exists(dir, function(exists){
            if(!exists) {

                //fs.mkdir(dir, function(){ done(true); });
                mkpath(dir, 0777, function (err) {
                    if (err) {
                        logger.error("error creating directory structure. ", dir);
                        done(err)
                    } else {
                        logger.info('Directory structure created. ', dir);
                        done(null, dir);
                    }
                });

            } else {
                done(null, dir);
            }
        });
    }
};

module.exports = filestore;