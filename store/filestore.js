
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
        privateFuncs.saveFile(this.config, storedata, this.config.previewWebsiteFile, buffer, done);
    },

    saveHtmlPage: function(html, storedata, done) {
        privateFuncs.saveFile(this.config, storedata, this.config.htmlFile, html, done);
    },

    saveImage: function(buffer, storedata, done) {

    },

    saveCss: function(buffer, storedata, done) {

    },

    saveJs: function(buffer, storedata, done) {

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

    saveFile: function(config, storedata, relPath, data, doneFunc) {

        this.getDirectoryPath(config, storedata, function(dirPath) {
            // save image file
            var filePath = path.join(dirPath, relPath);

            console.log('storing file in ' + filePath);
            fs.writeFile(filePath, data, 'utf8', doneFunc);
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