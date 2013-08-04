# Element Proxy

Documentation for [element_proxy.js](https://github.com/scriby/browser-harness/blob/master/server/element_proxy.js).

An element proxy is used to represent one or more DOM elements on the server. It attempts to emulate the functionality of jQuery
variable, such that working with it feels natural.

Additionally, it can be passed as an argument to functions that are run in the browser.

Check out the [jQuery documentation](http://api.jquery.com/) for more information on what methods are available on the
element proxy. If you find something missing, feel free to point it out (or send a pull request).'

In addition to the base jQuery methods, findElement, findVisible, findElements, and findVisibles are available on
element proxies. These behave the same as the methods on the driver, but are executed from within the context of
the current element. So calling `element.findVisibles('div')` will find div elements within the element.

Unlike the browse, all methods are asynchronous as they need to make a roundtrip to the browser to execute.
The callback may be provided as the last argument, or if asyncblock is used, no callback should be provided.

Here are a few representative examples:

```javascript
asyncblock(function(){
  var divs = driver.findVisibles('div');
  divs.filter(function(){ return this.height() > 10; }).css('color', 'red');
});
```

```javascript
async.waterfall([
  function(callback){
    driver.findVisibles('div', callback);
  },

  function(divs, callback){
    divs.filter(function() { return this.height() > 10; }, callback);
  },

  function(tallDivs, callback){
    tallDivs.css('color, 'red', callback);
  }
], function(err){
  callback(err);
});
```

```javascript
asyncblock(function(){
  //Click requires the button be both visible and enabled
  driver.findVisible('button').click();
});
```