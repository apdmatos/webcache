var urlMod      = require('url')                        ,
    http        = require('follow-redirects').http      ,
    https       = require('follow-redirects').https     ,
    logger      = require('../logger')                  ,
    RSVP        = require('rsvp')                       ;

/**
 * @constructor
 * Reponsible to do http requests to web page assets
 * @param  {int} timeout The timeout to get every http asset
 */
function webAssetsClient(timeout) {
    this.timeout = timeout;
}

webAssetsClient.prototype = {

    /**
     * Http Client to get web assets
     * @param  {[type]}   baseUrl       [description]
     * @param  {[type]}   relativeUrl   [description]
     * @param  {[type]}   format        [description]
     * @return {Promise}                That will return the requested asset file
     */
    getAssetFile: function(baseUrl, relativeUrl, format) {

        format = format || 'utf8';
        var url = urlMod.resolve(baseUrl, relativeUrl);

        logger.info('requesting file: ' + url);

        return requestAssetTimeout(url, format, this.timeout);     
    }
};

/**
 * Helper function to do the request using the promise RSVP
 * @param  {String} url     The url to request for
 * @param  {String} format  The response encoding format
 * @param  {int} timeout    The default timeout to get an asset
 * @return {Promise}         
 */
function requestAssetTimeout(url, format, timeout) {
    return new RSVP.Promise(function(resolve, reject) {
        
        var protocol = url.indexOf("http://") == 0 ? http : https;
        var req = protocol.request(url, function(res) {
            logger.info("url: " + url + " \nstatuscode: ", res.statusCode);

            var contentType = res.headers['content-type'];

            var data = '';
            res.setEncoding(format);

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function() {
                logger.info('request ended successfully to the url: ' + url);
                resolve(data);
            });
        });

        if(timeout) {
            req.on('socket', function (socket) {
                socket.setTimeout(timeout);  
                socket.on('timeout', function() {
                    req.abort();
                    logger.warn('timeout getting the url: ' + url);
                    reject('request timed out');
                });
            });
        }

        req.on('error', function(e) {
            logger.error('ERROR getting asset file ' + url, e);
            reject(e);
        });

        req.end();
    });
}

module.exports = webAssetsClient;
