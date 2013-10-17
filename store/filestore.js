
var urlMod = require('url');
var utils = require('./../util');
var path = require('path');
var fs = require('fs');



function filestore(config) {

    this.config = config;
}


filestore.prototype = {

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

    getImagesRelativePath: function() {
        return this.config.imageFiles;
    },

    getCSSRelativePath: function() {
        return this.config.cssFiles;
    },

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