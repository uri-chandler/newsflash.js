var expect = require('chai').expect;
var newsflash = require('../src/newsflash');

describe('newsflash', function(){

	it('has 4 basic pub-sub functions (on, off, once, emit)', function(){
		expect(newsflash.on).to.be.a('function');
		expect(newsflash.off).to.be.a('function');
		expect(newsflash.once).to.be.a('function');
		expect(newsflash.emit).to.be.a('function');
	});

	it('can register and emit single events', function(done){
		newsflash.on('foo', done);
		newsflash.emit('foo');
	});

	it('can register and emit a multi-event', function(done){
		newsflash.on(['bar', 'baz'], done);
		newsflash.emit(['bar', 'baz']);
	});

	it('triggers a multi-event when all single-events occured', function(done){
		var first, second, multi;

		newsflash.on('qwe', function(){
			first = true;
		});

		newsflash.on('asd', function(){
			second = true;
		});

		newsflash.on(['qwe', 'asd'], function(){
			multi = true;
			expect(first).to.equal(true);
			expect(second).to.equal(true);
			done();
		});

		newsflash.emit('qwe');
		newsflash.emit('asd');

	});

	it('triggers all single-events when a multi-event occurs', function(done){
		var one, two, multi;

		newsflash.on('one', function(){
			one = true;
		});

		newsflash.on('two', function(){
			two = true;
		});

		newsflash.on(['one', 'two'], function(){
			multi = true;
			expect(one).to.equal(true);
			expect(two).to.equal(true);
			done();
		});

		newsflash.emit(['one', 'two']);

	});

	it('can register a handler to only run once', function(done){
		var count = 0;

		newsflash.once('count-up', function(){
			count++;
		});

		newsflash.emit('count-up');
		newsflash.emit('count-up');
		newsflash.emit('count-up');

		expect(count).to.equal(1);
		done();
	});

	it('can un-subscribe an event handler', function(done){
		var count = 0, subID;

		subID = newsflash.on('count-up', function(){
			count++;
		});

		newsflash.emit('count-up');
		newsflash.emit('count-up');

		newsflash.off('count-up', subID);

		newsflash.emit('count-up');

		expect(count).to.equal(2);
		done();
	});

});
