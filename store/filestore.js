
var urlMod  = require('url')        ,
    utils   = require('./../util')  ,
    path    = require('path')       ,
    fs      = require('fs')         ;

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
     * @param  {Buffer}      buffer
     * @param  {StoreData}   storedata The state for store
     * @param  {Function}    done      Function to call when it's done
     */
    saveWebsitePreview: function(buffer, storedata, done) {
        console.log(storedata.toString());
        privateFuncs.saveFile(
            this.config,
            storedata, 
            null, 
            this.config.previewWebsiteFile, 
            buffer, 
            'binary',
            done
        );
    },

    /**
     * Saves the page HTML on disk
     * @param  {String}      html
     * @param  {StoreData}   storedata The state for store
     * @param  {Function}    done      Function to call when it's done
     */
    saveHtmlPage: function(html, storedata, done) {
        privateFuncs.saveFile(
            this.config, 
            storedata, 
            null, 
            this.config.htmlFile, 
            html, 
            'utf8',
            done
        );
    },

    /**
     * Saves the page HTML on disk
     * @param  {Buffer}      buffer
     * @param  {StoreData}   storedata The state for store
     * @param  {filename}    filename  the name for the file on disk
     * @param  {Function}    done      Function to call when it's done
     */
    saveImage: function(buffer, storedata, filename, done) {
        privateFuncs.saveFile(
            this.config, 
            storedata, 
            this.getImagesRelativePath(), 
            filename, 
            buffer, 
            'binary',
            done
        );
    },

    /**
     * Saves the css on disk
     * @param  {String}      buffer
     * @param  {StoreData}   storedata The state for store
     * @param  {filename}    filename  the name for the file on disk
     * @param  {Function}    done      Function to call when it's done
     */
    saveCss: function(buffer, storedata, filename, done) {
        privateFuncs.saveFile(
            this.config, 
            storedata, 
            this.getCSSRelativePath(), 
            filename, 
            buffer, 
            'utf8',
            done
        );
    },

    /**
     * Saves the js on disk
     * @param  {String}      buffer
     * @param  {StoreData}   storedata The state for store
     * @param  {filename}    filename  the name for the file on disk
     * @param  {Function}    done      Function to call when it's done
     */
    saveJs: function(buffer, storedata, filename, done) {
        privateFuncs.saveFile(
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



// private functions
var privateFuncs = {

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