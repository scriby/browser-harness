# Harness.js

Documentation for [harness.js](https://github.com/scriby/browser-harness/blob/master/server/harness.js).

## Methods

### listen

void listen(port, [callback])

Starts the browser harness server listening on this port. The server receives incoming connections from browsers
that will run tests.

```javascript
var harness = require('browser-harness');

harness.listen(4500, function(){
    //Now that the server is listening, spawn a browser to the harness.html to connect to it
  });
});
```

## Events

### events.ready

Indicates that a browser has connected to the harness and is ready to run tests. A [driver](https://github.com/scriby/browser-harness/blob/master/docs/driver.md)
is the only argument passed to the event callback.

```javascript
harness.events.once('ready', function(driver){
  //Received a browser connection, use the driver to interact with it
});
```