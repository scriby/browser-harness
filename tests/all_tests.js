var asyncblock = require('asyncblock');
if( asyncblock.enableTransform(module)) { return; }

var assert = require("assert");
require('./test_server.js');
var testBrowser = require('./test_browser.js');
var harness = require('browser-harness');

//Lower timeout settings for tests so they go faster
harness.config.timeoutMS = 10;
harness.config.retryMS = 3;

describe('', function(){
    var args = { baseUrl: 'http://localhost:4501' };

    before(function(done){
        harness.listen(4500, function(){
            testBrowser.getDriver(function(err, driver){
                args.driver = driver;

                done(err);
            });

            testBrowser.open();
        });
    });

    require('./test/simple.js').setup(args);
    require('./test/find.js').setup(args);
    require('./test/click.js').setup(args);
    require('./test/visible.js').setup(args);
    require('./test/elements.js').setup(args);
    require('./test/waitfor.js').setup(args);
    require('./test/jquery.js').setup(args);
    require('./test/transition.js').setup(args);
    require('./test/no-fibers.js').setup(args);

    after(function(){
        testBrowser.close();
    });
});
