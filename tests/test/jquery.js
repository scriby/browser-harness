var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing jquery.html', function(){
        var driver;

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/jquery.html');
        });

        tu.it('selecting test-div works', function(){
            var testDiv = driver.findVisible('.test-div');
            assert(testDiv);
            assert(testDiv.length);
        });

        tu.it('jQuery variable is not clobbered', function(){
            var test = driver.exec(function(){
                return $._test;
            });

            assert.equal(test, "verify harness doesn't clobber jquery in the frame");
        });

        tu.it('driver.$ creates an element', function(){
            var element = driver.$('<div>test</div>').addClass('made-with-driver');
            var body = driver.findVisible('body');
            body.append(element);

            var appended = body.findVisible('.made-with-driver');

            assert(appended);
            assert.equal(appended.length, 1);
        });

        tu.it('driver.$ converts an element', function(){
            assert.equal(driver.$(driver.findVisibles('span')[0]).html(), 'asdf');
        });
    });
};