


// TODO: this should be on a different repository to be reusable by another projects



var formatters = {

	string: function(param) {
		return "'" + param + "'";
	}

};


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