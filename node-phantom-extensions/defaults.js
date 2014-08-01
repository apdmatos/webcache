
/**
 * Default configurations for phantom extension module
 */
module.exports = {
    
    /**
     * The retry count number before returning error
     * @type {Number}
     */
    defaultRetryCount : 1,

    /**
     * The default timeout before returning error
     * @type {Number}
     */
    defaultTimeout : 5000,

    /**
     * The default page size
     * @type {Object}
     */
    defaultPageSize : { width: 1024, height: 800 }
};