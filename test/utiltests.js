var should 			= require("should"),
	assert			= require("assert"),
	util 			= require("../util"),
	sionon			= require("sinon");


describe('Util', function(){

	describe('#newGuid()', function(){
    	it('should return a valid guid string', function(){
      		// arrange

      		// act
      		var guid = util.newGuid();

      		// assert
      		var parts = guid.split('-');
      		parts.length.should.be.exactly(5);
      		parts[0].length.should.be.exactly(8);
      		parts[1].length.should.be.exactly(4);
      		parts[2].length.should.be.exactly(4);
      		parts[3].length.should.be.exactly(4);
      		parts[4].length.should.be.exactly(12);
    	});
  	});

  	describe('#callbackOrDummy()', function(){
    	it('should return an empty function when the argument is not present', function(){
      		// arrange
      		var func = null;

      		// act
      		var callback = util.callbackOrDummy(func);

      		// assert
      		(typeof(callback) == 'function').should.be.true;
    	});

    	it("should return the function I just passed to it", function() {
    		var func = sionon.spy();

    		var callback = util.callbackOrDummy(func);

    		callback();
    		
    		callback.should.be.equal(func);
    		func.called.should.be.true;
    	});
  	});

  	describe('#callbackWrapper(func, context, params)', function(){
    	// TO BE DONE
  	});

  	describe('#extend(obj1, obj2)', function(){
    	// TO BE DONE
  	});

  	describe('#waitForCallbacks(doneFn, context)', function(){
    	// TO BE DONE
  	});

  	describe('#getFirstKey(obj)', function(){
    	// TO BE DONE
  	});

  	describe('#timeout(callback, timeoutCallback, timeout)', function(){
    	// TO BE DONE
  	});
});