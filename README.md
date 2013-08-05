Browser Harness
===============

### What is this?

* **Simple** - Use jQuery to interact with items on the page and check expected conditions. Optional fibers support makes test writing and reading straightforward.
* **Fast** - Can perform 50+ actions per second in the browser
* **Cross-browser** - Tests run on any modern web browser, and even some old ones
* **Flexible** - Write tests in whatever node.js framework you want

### Browser Support

```
              Tested    "Should work"
Chrome 4+        ✓
Firefox 3+       ✓
Safari 3+        ✓
Opera 10.61+                  ✓
IE 5.5+                       ✓
IE 8+            ✓
iOS              ✓
Android                       ✓
PhantomJS        ✓
SlimerJS                      ✓
Other                         ✓
```

### How does it work?

* Your tests include the browser-harness module and tell it to start listening for connections
* Your test (or some outside process) opens a browser to http://your-test-site/path/to/harness.html?host=path-to-the-browser-harness-server
* Harness.html connects to the browser harness server, and begins running your tests
* Your tests will control a browser running within an iframe in harness.html

### See it in action

A standalone example of using browser harness can be found under the [browser-harness-bootstrap-tests](https://github.com/scriby/browser-harness-bootstrap-tests) repository.

#### Screencasts

* [Tests running in Chrome](http://screencast.com/t/0TaRAmUD)
* [Tests running in Firefox](http://screencast.com/t/n6hxBjMhsh)
* [Tests running in Safari](http://screencast.com/t/3HmnMfMC)
* [Tests running in PhantomJS](http://screencast.com/t/Wd4q5kSPsT)

### Example

The following example uses mocha, but any test framework may be used.

```javascript
//This little utility function helps reduce the boilerplate needed by each test
var _it = function(name, exec){
  it(name, function(done){
    asyncblock(exec, done);
  });
};

describe('An abridged test of the bootstrap docs', function(){
  var driver, testBrowser;

  before(function(done){
    //Tell the browser harness to listen for connections on port 4500
    harness.listen(4500, function(){
      //This event is fired when a browser makes a connection and is ready
      harness.events.once('ready', function(_driver){
        driver = _driver;
          done();
      });

      //The harness.Browser class can be used to spawn browser instances
      //Here, we're using default settings for Chrome
      testBrowser = new harness.Browser({ type: 'chrome' });

      //Tell the browser to open the harness page
      //By default, the test will connect to the harness server at localhost:4500
      //Pass host=address on the query string to change the address
      testBrowser.open('http://localhost:8000/harness.html');
    });
  });

  it('Loads index.html', function(done){
    //setUrl tells the browser to navigate to the page.
    //The callback is called once the load event of the page has been called
    driver.setUrl('http://localhost:8000/index.html', done);
  });

  //This test uses the _it method defined above,
  //which lets code be written in "blocking style"
  _it('Finds the h1 element', function(done){
    //findVisible finds an element only if it exists and is visible
    //It accepts any jQuery selector
    var h1 = driver.findVisible('.masthead h1');

    //findVisible returns an object that behaves like a jQuery variable
    assert.equal(h1.length, 1);

    //The call to .html() makes a roundtrip to the browser, but fibers makes it
    //so we don't have to deal with callbacks directly
    assert.equal(h1.html(), 'Bootstrap');
  });

  _it('Clicks on javascript', function(){
    //The selector used here is not ideal. Usually we want to select by an id or class
    //For testing your own applications, it's generally better to
    //modify the code than use goofy selectors
    driver.findVisible('a[href="./javascript.html"]').click(); //jQuery chaining works

    //Browser harness encourages you not to wait for explicit time periods.
    //In fact, it doesn't even have a built-in sleep function
    //Instead, use conditions that indicate when it's safe to continue test execution
    driver.waitFor(function(){
      //This function runs from within the browser context
      return location.href.indexOf('/javascript.html') >= 0;
    });
  });

  _it('Clicks on Modal', function(){
    driver.findVisible('a[href="#modals"]').click();

    driver.waitFor(function(){
        return location.href.indexOf('#modals') >= 0;
    });
  });

  _it('Launches the demo modal', function(){
    driver.findVisible('a[href="#myModal"]').click();
    var modal = driver.findVisible('#myModal');

    //You can call findVisible(s)/findElement(s) on elements
    //to scope the call to children of that element
    modal.findVisible('.modal-footer .btn[data-dismiss=modal]').click();

    //The close is animated, so need to wait for it
    driver.waitFor(function(){
      return $('#myModal').css('display') === 'none';
    });
  });

  after(function(){
    //Close the browser instance that we spawned
    testBrowser.close();
  });
});
```

### Fibers support

The module has built-in support for [fibers](https://github.com/laverdet/node-fibers) via asyncblock](https://github.com/scriby/asyncblock).
To take advantage of it, all you need to do is install asyncblock from npm and wrap your test with it (see above for an example).

Browser harness will auto-detect that asyncblock is being used and turn all asynchronous calls into "blocking-style".

Note that using fibers to write the tests is optional, but it is highly recommended. See [no-fibers.js](https://github.com/scriby/browser-harness/blob/master/tests/test/no-fibers.js) for an example of writing tests without fibers.

### Limitations

Due to the way browser harness interacts with the browser, there are a few limitations.

* Requires [harness.html](https://github.com/scriby/browser-harness/blob/master/client/harness.html) be served from the domain of the site/application being tested
    * Warning: Be careful not to include harness.html in production, as it opens a potential cross-site scripting attack vector
* Can only interact with pages hosted from within a single domain (barring some CORS configuration)
* Can not upload files from the local computer (but should be able to spoof file uploads via javascript)
* Can not interact directly with cookies that have the httponly flag

### Documentation

[docs](https://github.com/scriby/browser-harness/tree/master/docs)

### Tests

There are tests for browser harness located under the "tests" folder.

To run the tests:

```
cd tests

#Install test dependencies
npm install

#Run test with mocha. Set a 10 second timeout as sometimes it takes a bit for the browser to open initially
#You can also use your global mocha installation if you have it installed already
./node_modules/mocha/bin/mocha all_tests.js -R spec -t 10000

#Edit the test_browser file to run the tests in a different browser (defaults to phantomjs)
```

### Roadmap


* More streamlined browser integration (windows)
* Handle alert, input, etc.
* Cookie handling
* SlimerJS integration
* Ability to take screen shots with phantomjs / slimerjs (possible with others?)
* Switch out NowJS support for plain Socket.IO for easier Windows support
* Better support detecting javascript errors in the browser
* Build in support for other event types like right click, mouse down, mouse up, keys, etc.
* More robust error handling
* See what can be done to make it easier to interact with file upload controls
* "Ease of use" improvements around common functions, like waiting for a specific page
* Documentation