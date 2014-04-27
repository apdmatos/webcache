

var should 			= require("should"),
	assert			= require("assert"),
	fifoContainer 	= require("../../containers/fifo");


describe('Containers/Fifo', function(){
	describe('#count()', function(){
    	it('should return 1 when there is one element on the collection', function(){
      		// arrange
      		var fifo = new fifoContainer();

      		// act
      		fifo.push(1)

      		// assert
      		fifo.count().should.be.exactly(1);//.and.be.a.Number;
    	});
		
		it('should return 0 when there is no element on the collection', function(){
      		// arrange
      		var fifo = new fifoContainer();

      		// act

      		// assert
      		fifo.count().should.be.exactly(0).and.be.a.Number;
    	});
  	});


  	describe('#push()', function(){
    	it('push should add an element to the collection', function(){
      		// arrange
      		var fifo = new fifoContainer();

      		// act
      		fifo.push(5)

      		// assert
      		fifo.count().should.be.exactly(1).and.be.a.Number;
    	});
		
		it('push should add many elements to the collection', function(){
      		// arrange
      		var fifo = new fifoContainer();

      		// act
      		fifo.push(5);
      		fifo.push(6);

      		// assert
      		fifo.count().should.be.exactly(2).and.be.a.Number;
    	});
  	});

  	describe('#pop()', function(){
    	it('Pop should retrieve an element from the collection', function(){
      		// arrange
      		var fifo = new fifoContainer();

      		// act
      		fifo.push(2);

      		// assert
      		fifo.count().should.be.exactly(1).and.be.a.Number;
      		fifo.pop().should.be.exactly(2).and.be.a.Number;
    	});
		
		it('Pop should respect the fifo order', function(){
      		// arrange
      		var fifo = new fifoContainer();

      		// act
      		fifo.push(2);
			fifo.push(3);

      		// assert
      		fifo.pop().should.be.exactly(2).and.be.a.Number;
      		fifo.pop().should.be.exactly(3).and.be.a.Number;
    	});

    	it('pop should return null when there are no elements on the collection', function(){
      		// arrange
      		var fifo = new fifoContainer();

      		// act

      		// assert
      		fifo.count().should.be.exactly(0).and.be.a.Number;
      		assert.equal(fifo.pop(), null);
    	});
  	});
})