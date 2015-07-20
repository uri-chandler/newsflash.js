# newsflash.js
###### A Multi-Event enabled Pub-Sub implementation

[Overview](#overview)  
[Motivation](#motivation)  
[Usage](#usage)  
[API](#api)

---

#### Overview
Newsflash.js is a Multi-Event enabled, Pub-Sub event-aggregator. In short, this means you can register an event handler to only run once multiple events 'foo' AND 'bar' have been published.

It has all the standard features you'd expect to see in a pub-sub implementation:
- `on(event, handler)`
- `off(event, handler)`
- `once(event, handler)`
- `emit(event, data)`


---

#### Motivation
Does the following scenario sound familiar:  
You need to run function `foo()` only if

1. `bar` has already happened

2. `baz` has already happened

3. If any of these happened without the other - don't trigger `foo()`.  

If you've ever had to implement this, you probably ended up saving some state-data in a shared scope, or worse - using timers.  

`Newsflash.js` to the rescue! No need to manage shared state-date or timers. It's as simple as registering an event handler - for multiple events.

---


#### Usage
Using the example above, where we need to run `foo()` - but only if both `bar` and `baz` have occured, we can now do this:  
```javascript
function foo(){
	// I need both 'bar' and 'baz' to run
}

var subscription = on(['bar', 'baz'], foo);

// At some later point, 'bar' occurs
emit('bar');

// At an even later point, 'baz' occurs
emit('baz');

// At this point, 'foo()' gets called
```  

It's that simple.  

A few notes to be aware of:

1. You can of course subscribe to 'bar' and 'baz' separtely, as each of them stands as a single event on it's own.  

2. A multi-event only gets called after a full-events-cycle is complete. This simply means that anytime you want to trigger the multi-event function `foo()`, you have to emit BOTH `bar` and `baz` (and all over again the next time you want to trigger `foo()`).  

3. There's a shortcut for triggering multi-events (in case you need to run `foo()` immediately at some point):
```javascript
// 'foo()' gets called immediately
// Also, if 'bar' or 'baz' have any event handlers on their own, they will also be triggered
emit(['bar', 'baz']);
```
* A multi-event is simply denoted as an array of events: `['even1', 'event2', ..., 'eventN']`




---
#### API

`on(event, handler)`  
Registers `handler` as a callback to run every time `event` is triggered. This function will return a `subscription-id` which can be used at a later point to un-subscribe to the event.

- `event`  
As a `String`, a single event to register to.  
As an `Array` of strings, a multi-event to register to. The order of the events in the array does not matter (it gets normalized internally).

- `handler`
Function callback that will get called whenever the event is published. If any data was published with the event, the callback will get this data as its only argument.

Example (single event):
```javascript
var subscription = on('foo', function(){  
	console.log('event "foo" fired');
});

// later, when we're done with this event:
// off('foo', subscription);
```  

Example (multi-event):
```javascript
var subscription = on(['foo', 'bar'], function(){  
	console.log('multi-event "foo, bar" fired');
});

// later, when we're done with this multi-event:
// off(['foo', 'bar'], subscription);
```  


---
`off(event, subscription)`  
Un-subscribe the handler associated with `subscription` from `event`. The `subscription` is created and returned by the `on(...)` API.

- `event`  
As a `String`, a single event to un-subscribe to.  
As an `Array` of string, a multi-event to un-subscribe to. The order of the events in the array does not matter (it gets normalized internally).

- `subscription`
The subscription-id that was generated when the `event` was registered.

Example (single event):
```javascript
// Assuming we got '1234' from an earlier call to 'on(...)'
off('foo', '1234');
```  

Example (multi-event):
```javascript
// Assuming we got '1234' from an earlier call to 'on(...)'
off(['foo', 'bar'], '1234');
```  

---
`once(event, handler)`  
Same as `on(...)` only the `handler` will only get triggered once, and will then be removed from the `event`. Any subsequent publications to `event` will NOT trigger `handler` (it has been deleted).

- `event`  
As a `String`, a single event to register to.  
As an `Array` of strings, a multi-event to register to. The order of the events in the array does not matter (it gets normalized internally).

- `handler`
Function callback that will get called ONLY ONE TIME, once the event is published. If any data was published with the event, the callback will get this data as the only argument.

Example (single event):
```javascript
var subscription = once('foo', function(){  
	console.log('event "foo" fired');
});
```  

Example (multi-event):
```javascript
var subscription = once(['foo', 'bar'], function(){  
	console.log('multi-event "foo, bar" fired');
});
```  

---
`emit(event, data)`  
Emits `event`, passing any received `data` to the registered handler(s).

- `event`  
As a `String`, a single event to emit.  
As an `Array` of strings, a multi-event to emit. The order of the events in the array does not matter (it gets normalized internally).

- `data` (optional)
Any type of data that you want to pass to a registered event handler.

Example (single event, no data):
```javascript
emit('foo');
```  

Example (multi-event, string-data):
```javascript
emit(['foo', 'bar'], 'newsflash is awesome!');
```
