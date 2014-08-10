var events = require('events').EventEmitter,
    utils  = require('util');

function queue() {

}

util.inherits(queue, events);
utils.extend(queue.prototype, {
    
    EVENTS: {
        newEnqueuedItem: 'newEnqueuedItem'
    },

    /**
     * [enqueuePage description]
     * @param  {EnqueueData} data the page parsing data to be stored
     */
    enqueuePage: function(data) { }

});

module.exports = queue;