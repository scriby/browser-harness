var testBrowser = require('../test_browser.js');
var harness = require('browser-harness');

exports.setup = function(_args){
    describe('When reusing the browser', function(){
        var args = { baseUrl: 'http://localhost:4501' };

        before(function(done){
            testBrowser.reset();
            testBrowser.getDriver(function(err, driver){
                args.driver = driver;

                done(err);
            });

            _args.driver.reuseBrowser();
        });

        require('./simple.js').setup(args);
    });
};