

/**
 * TODO: this should be on a different repository to be reusable by another projects
 * Formaters to pass parameters to functions
 * @type {Object, Function}
 */
var formatters = {

    /**
     * parses the parameter to be used as a string parameter to passed into a function
     * @param  {String} param 
     * @return {String} A new string with ''
     */
    string: function(param) {
        return "'" + param + "'";
    }

};


/**
 * This function will return a string with a auto execution function with parameters to be executed on 
 * phantomJS process
 * @param  {Function} func The function to pass the parameters to
 * @param  {Object[]} args The function parameters
 * @return {String}        The function with the parameters to be sent to phantomJS process
 */
module.exports = function (func, args) {

    var params = "(";
    if(args) {
        for(var i = 0, len = args.length; i < len; ++i) {

            var param = args[i];
            var formatter = formatters[typeof(param)];
            if(!formatter) throw "No formatter defined for type " + typeof(param);

            params += formatter(param) + ',';
        }

        // remove the last ',' character
        params = params.substring(0, params.length - 1);
    }

    params += ")";
    

    // when this function executes ww'll get the results from the browser
    return new Function("return " + func.toString() + params);
}