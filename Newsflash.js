var topics = {};

function subscribe(event, handler){

	topics[event] = topics[event] || {};

	handler.id = Math.random().toString().slice(2);

	topics[event][handler.id] = handler;

	if (handler.multiEvent){
		event.split(',').forEach(function(e){

			topics[e] = topics[e] || {};

			if (topics[e].multiEvent){
				return;
			}

			topics[e].multiEvent = subscribe(e, function(){
				publishMulti(e, event);
			});
		});
	}

	return handler.id;
}

function unsubscribe(event, handlerID){

	if (!topics[event] || !topics[event][handlerID]) {
		return false;
	}

	delete topics[event][handlerID];
	return true;
}

function publish(event, data){

	if (!topics[event]) {
		return;
	}

	Object.keys(topics[event]).forEach(function(handler){

		handler = topics[event][handler];

		if (typeof handler !== 'function'){
			return;
		}

		handler(data);

		if (handler.once){
			unsubscribe(event, handler.id);
		}
	});
}

function publishMulti(single, multi){

	var ready = true;
	topics[multi][single] = true;

	multi.split(',').forEach(function(event){
		if (!topics[multi][event]){
			ready = false;
		}
	});

	if (!ready){
		return;
	}

	publish(multi);

	multi.split(',').forEach(function(event){
		topics[multi][event] = false;
	});
}


modules.exports = {

	on	: function on(event, handler){

		// Invalid handler
		if (typeof handler !== 'function'){
			throw 'On.Error: Invalid handler: ' +handler+ '. Handler must be a function';
		}

		// Single event
		if (typeof event === 'string'){
			return subscribe(event, handler);
		}

		// Multiple events
		if (Array.isArray(event)){
			handler.multiEvent = true;
			return subscribe(event.sort().join(','), handler);
		}

		// Invalid event
		throw 'On.Error: Invalid event: ' +event+ '. Must be string or array of strings';
	},

	off	: function off(event, handlerID){

		// Invalid ID
		if (typeof handlerID !== 'string'){
			throw 'Off.Error: Invalid handler ID: ' + handlerID;
		}

		// Single event
		if (typeof event === 'string'){
			unsubscribe(event, handlerID);
			return;
		}

		// Multiple events
		if (Array.isArray(event)){
			unsubscribe(event.sort().join(','), handlerID);
			return;
		}

		// Invalid event
		throw 'Off.Error: Invalid event: ' +event+ '. Must be string or array of strings';
	},

	once: 	function once(event, handler){

		handler.once = true;
		return on(event, handler);
	},

	emit: function emit(event, data){

		// Single event
		if (typeof event === 'string'){
			publish(event, data);
			return;
		}

		// Invalid event
		throw 'Emit.Error: Invalid event: ' +event+ '. Must be string';
	}
};
