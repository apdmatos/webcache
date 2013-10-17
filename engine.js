

var phantom=require('node-phantom');
//var path = require('path');
//var fs = require('fs');
var urlMod = require('url');
//var utils = require('./util')
var http = require('http');
var https = require('https');


function engine(processor) {

    this.processor = processor;

}

//TODO: how to handle errors?

engine.prototype = {

    load: function(url, callback) {

        var self = this;
        this.loadHtmlFile(url, function(page, ph) {
            
            var end = function() {
                ph.exit();
                callback();
            }

            self.processor.process(url, self, page, null, end);
        })
    },

    getAssetFile: function(baseUrl, relativeUrl, callback, errorCallback) {

        var url = urlMod.resolve(baseUrl, relativeUrl);
        
        var protocol = url.indexOf("http://") == 0 ? http : https;
        var req = protocol.request(url, function(res) {

            console.log("statuscode: ", res.statusCode);

            var contentType = res.headers['content-type'];

            var data = '';
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function() {
                callback(data);
            });

        })

        req.end();

        req.on('error', function(e) {
            console.log('ERROR getting asset file ', e);
            //an error has occurred... Handle it
            errorCallback(e);
        });
    },

    loadHtmlFile: function(url, callback) {

        console.log('opening page: ' + url);

        var self = this;
        phantom.create(function(err,ph) {
            ph.createPage(function(err,page) {
                page.set('viewportSize', {width: 1024, height: 800})
                page.open(url, function(err,status) {

                    console.log("opened site? ", status);
                    callback(page, ph);
                });
            });
        });
    }
}


module.exports = engine;


