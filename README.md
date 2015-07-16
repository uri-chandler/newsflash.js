# newsflash.js
###### A Multi-Event enabled Pub-Sub event aggregator
---

Newsflash.js is a Multi-Event enabled Pub-Sub event aggregator. In short, this means you can register an event handler to only run once multiple events 'foo' AND 'bar' have been published.

It has all the standard features you'd expect to see in a pub-sub implementation:
- on(event, handler)
- off(event, handler)
- once(event, handler)
- emit(event, data)


### API

`on(event, handler)`  
Registers `handler` as a callback to run every time `event` is triggered.  

- `event`  
As a String, a single event to register to.  
As an Array of String, a multi-event to register to. The order of the events in the array does not matter (it gets normalized internally).

- `handler`
Function callback that will get called whenever the event is published. If any data was published with the event, the callback will get this data as the only argument.

Example (single event):
```javascript
on('foo', function(){  
	console.log('event "foo" fired');
})
```  

Example (multi-event):
```javascript
on(['foo', 'bar'], function(){  
	console.log('multi-event "foo, bar" fired');
})
```  
