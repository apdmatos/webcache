

/**
 * This type represents a collection
 * @return {fifoContainer}
 */
function fifo() {
	this.elements = [];
}

fifo.prototype = {

	/**
	 * returns the number of elements in the collection
	 * @return {[type]} [description]
	 */
	count: function() {
		return this.elements.length;
	},

	/**
	 * Adds the element to the end of the collection
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	push: function(element) {
		this.elements.push(element);
	},

	/**
	 * returns the first element of the collection
	 * @return {Object}
	 */
	pop: function() {
		if(this.count() == 0) {
			return null;
		}
		
		return this.elements.shift();
	}
};

module.exports = fifo;