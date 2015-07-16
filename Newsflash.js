/**
 * @fileoverview: Newsflash is a Multi-Event enabled Pub-Sub module
 *
 * This means that along with the standard pub-sub functionality of subscribing and publishing events,
 * you could subscribe a single handler to only run after two (or more) events have been published. Also, the
 * published events can be published separately or in a single call to the publishing API.
 *
 * For more information on usage, see README.md
 * For more information on the implementation, keep reading through the source code and comments.
 *
 * For feedback, please open an issue on the Github page.
 *
 */


// A place for all the subscribed events to be stored
var topics = {};

/**
 * Subscribes <handler> as an event handler for the passed in <event>.
 * Also returns a subscription-id for later use with 'off(subscription-id)'.
 * This is a private API.
 *
 * @param  {String}		event  		The name of the event or multi-event to subscribe to. If the event is a multi-event,
 *                           		it will be a comma-separated list of events
 *
 * @param  {Function}	handler 	The function that will be called once the event or multi-event has been published
 *
 * @return {String} 				A subscription-id (string) with which you could un-subscribe to this event at a later point
 *                        			using 'off(subscription-id)'
*/
function subscribe(event, handler){

	// Default the event cache
	topics[event] = topics[event] || {};

	// Generate subscription-id, and register the event handler with is
	handler.id = Math.random().toString().slice(2);
	topics[event][handler.id] = handler;

	// For multi-events, each separate events gets a special 'multiEvent' property.
	// This property points to a function that triggers the multi-event publisher (the publishMulti fn).
	// Which in turn checks if all the events in the multi-event have been triggered (in which case the <handler> gets called)
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

	// This gets returned to the user so that they can un-subscribe to this event at a later time
	return handler.id;
}

/**
 * Remove the event handler associated with the passed in <handlerID> from the topic <event>
 * This is a private API.
 *
 * @param  {String}		event			An single event, or a multi-event as a sorted, comma-separated list of events
 * @param  {Function}	handlerID		A subscription-id that identifies the subscribed <handler> to be removed
 * @return {Boolean}					True if the <handler> was found on <topic> and was removed. False otherwise
 */
function unsubscribe(event, handlerID){

	if (!topics[event] || !topics[event][handlerID]) {
		return false;
	}

	delete topics[event][handlerID];
	return true;
}

/**
 * Publish a the single <event> with any passed in <data>.
 * This is a private API
 *
 * @param  {String}		event	The single event to publish. All registered handlers for this event will be triggered.
 * @param  {*}			[data]	The data that should be passed to <handler>
 * @return {undefined}
 */
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

/**
 * Publishes a multi-event, trigerring any subscribed event-handlers that subscribed to the passed in <multi> event.
 * This works is as follows:
 *   1) For any multi-event, both the multi-event, and each of it's separate events - gets registered as a new topic.
 *   2) Also, on the multi-event topic itself, we add a boolean property for each of the separate events
 *   3) When a separate event gets called for the first time, the corresponding boolean property gets set to 'true'
 *   4) Once all separate events have been called, the multi-event itself gets published, triggering any registered <handler>
 *   5) Last, we reset all the separate events booleans back to false (so that they will need to be published all together
 *      all together again for the multi-event to fire)
 *
 * This is a private API.
 *
 * @param  {String}		single		The name of the separate event that was published.
 * @param  {String}		multi		The multi-event that is being published (or 'checked-if-should-be' published).
 * @return {undefined}
 */
function publishMulti(single, multi){

	// Default to 'ready' (we can publish the multi-event)
	var ready = true;
	topics[multi][single] = true;

	// If any of the other events in this multi-event are not ready,
	// cancel the publication of this multi-event (until all separate events are ready)
	multi.split(',').forEach(function(event){
		if (!topics[multi][event]){
			ready = false;
		}
	});

	if (!ready){
		return;
	}

	// All separate events have been published, we can now publish the multi-event
	publish(multi);

	// Reset the status of each separate event to 'false', so that the multi-event won't get fired twice
	// without a full cycle of publishing each separate event again
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
