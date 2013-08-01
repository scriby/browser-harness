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
    });
};