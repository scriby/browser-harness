# Driver.js

Documentation for [driver.js](https://github.com/scriby/browser-harness/blob/master/server/driver.js).

void **setUrl**(url: string, [callback])

Loads the specified url in the test frame. Loading in the page to test is the first thing that tests should do. It's also
fine to change the url multiple times within a test manually, but note that cache and cookies will not be reset.

setUrl calls its callback when the load event of the page being tested has fired.

The callback is not required if using asyncblock to wrap the code.

```javascript
asyncblock(function(){
  driver.setUrl('http://localhost:8000/test-page.html');

  //Page is ready to be interacted with now
  var body = driver.findVisible('body');
}, callback);
```

```javascript
driver.setUrl('http://localhost:8000/test-page.html', function(err){
  if(err){ return callback(err); }

  //Page is ready to be interacted with now
  driver.findVisible('body', function(err, body){
    if(err){ return callback(err); }

    callback();
  });
});
```

[ElementProxy]((https://github.com/scriby/browser-harness/blob/master/docs/element_proxy.md) **findElement**(selector: string, [callback])

Finds an element on the page with the given jQuery selector. If the specified element is not found, or more than one
instance of the specified element is found, browser harness will try to find it again until the configured timeout. If
after the timeout period elapses the element cannot be found, an error will be returned to the callback.

The callback is not required if using asyncblock to wrap the code.

```javascript
asyncblock(function(){
  var body = driver.findElement('body');
  console.log(body.html());
}, callback);
```

```javascript
var body = driver.findElement('body', function(err, body){
  if(err){ return callback(err); }

  body.html(function(err, html){
    if(err){ return callback(err); }

    console.log(html);
    callback();
  });
});
```

[ElementProxy]((https://github.com/scriby/browser-harness/blob/master/docs/element_proxy.md) **findElements**(selector: string, [callback])

Like findElement, but can select multiple elements. If no elements are found, browser harness will try to find them until
the configured timeout. If after the timeout period elapses no elements are found, an error will be returned to the callback.

The callback is not required if using asyncblock to wrap the code.

```javascript
asyncblock(function(){
  driver.findElements('input[type=text]').val('test');
}, callback);
```

```javascript
async.forEach(
  driver.findElements('input[type=text]'),
  function(textbox, callback){
    textbox.val('test', callback);
  },
  function(err){
    callback(err);
  }
```

[ElementProxy]((https://github.com/scriby/browser-harness/blob/master/docs/element_proxy.md) **find**(selector: string, [callback])

Alias for findElements. (Mirrors the jQuery find method)

[ElementProxy]((https://github.com/scriby/browser-harness/blob/master/docs/element_proxy.md) **findVisible**(selector: string, [callback])

Like findElement, but requires that the element be visible. This should be the most commonly used method to search for elements
as it ensures that the test isn't interacting with an element that the user could not see.

"visible" means:

* css display != 'none' (on element or parent)
* css visibility != 'hidden' (on element or parent)
* non-zero width and height

Note that it does not currently check the opacity of the element.

The callback is not required if using asyncblock to wrap the code.

```javascript
asyncblock(function(){
  var body = driver.findVisible('body');
  console.log(body.html());
}, callback);
```

```javascript
var body = driver.findVisible('body', function(err, body){
  if(err){ return callback(err); }

  body.html(function(err, html){
    if(err){ return callback(err); }

    console.log(html);
    callback();
  });
});
```

[ElementProxy]((https://github.com/scriby/browser-harness/blob/master/docs/element_proxy.md) **findVisibles**(selector: string, [callback])

Like findElements, but only returns elements that are visible. If no visible elements are found, will retry up until
the timeout period before returning an error.

The callback is not required if using asyncblock to wrap the code.

```javascript
asyncblock(function(){
  driver.findVisibles('input[type=text]').val('test');
}, callback);
```

```javascript
async.forEach(
  driver.findVisibles('input[type=text]'),
  function(textbox, callback){
    textbox.val('test', callback);
  },
  function(err){
    callback(err);
  }
```

void **waitFor**(condition: function || { condition: function, exec: function, timeoutMS: int }, [callback])

Waits for a condition to be true, then calls its callback. If the timeout period elapses before the condition becomes true,
an error is returned to the callback.

Sometimes it is necessary to execute an action in conjunction with waiting on a condition. For example, click a button,
then wait for an event to be emitted in the browser. An "exec" function can be provided to trigger an action which should
make the condition true.

Additionally, an explicit timeout may be specified for the amount of time to wait before giving up and returning an error.
Note that the provided condition will be polled until it is true, at a configurable rate.

The callback is not required if using asyncblock to wrap the code.

```javascript
asyncblock(function(){
  driver.waitFor(function(){
    return location.href.indexOf('test-page.html') >= 0;
  });
}, callback);
```

```javascript
asyncblock(function(){
  driver.waitFor({
    condition: function(callback){
      events.once('custom event', callback);
    },

    exec: function(){
      $('.test-button').click();
    }
  });
}, callback);
```

```javascript
driver.waitFor(
  function(){
    return location.href.indexOf('test-page.html') >= 0;
  },

  function(err){
    callback(err);
  }
);
```

any **exec**(func: function || { func: function, args: [] }, [callback])

Execute arbitrary javascript in the browser and return the result. The javascript to execute is specified in the func
argument. To pass arguments to the function, include an args array in the call.

Exec can be used to interact with the page in ways that the driver doesn't support directly.

The callback is not required if using asyncblock to wrap the code.

```javascript
asyncblock(function(){
  driver.exec(function(){
    history.back();
  });
}, callback);
```

```javascript
asyncblock(function(){
  var result = driver.exec({
    func: function(element){
      return myApp.someFunction(element);
    },

    args: [ element ]
  });

  console.log(result);
}, callback);
```

```javascript
driver.exec({
  func: function(element){
    return myApp.someFunction(element);
  },

  args: [ element ]
}, function(err, result){
  if(err) { return callback(err); }

  console.log(result);
  callback();
});
```