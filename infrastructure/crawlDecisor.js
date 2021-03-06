var urlMod   = require('url')       ,
    RSVP     = require('rsvp')      ,
    path     = require('path')      ;

function crawlDecisor(basePath) {
    this.basePath = basePath;
}

crawlDecisor.prototype = {

    /**
     * this method generated the page location on disk
     * @param  {string} url the page url to crawl
     * @return {Promise[string]}     the page location
     */
    generatePageLocation: function(url) {
        var self = this;
        return new RSVP.Promise(function(resolve, reject){
            var hostname = urlMod.parse(url).hostname;
            var currDate = getDate();
            
            var location = path.join(self.basePath, hostname, currDate);
            resolve(location);
        });
    },

    /**
     * verifies if a page should be crawled or not.
     * @return {Promise[bool]}     a decision if the page should be crawled or not
     */
    crawl: function() {
        return RSVP.Promise.resolve(false);
    }
};

/**
 * formats the current date to {year}{month}{day}
 * @return a formated date
 */
function getDate() {
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    return year + '' + month + '' + day;
}


module.exports = crawlDecisor;