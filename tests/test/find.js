var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing find.html', function(){
        var driver, exceptionOccurred;

        tu.afterEach(function(){
           exceptionOccurred = false;
        });

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/find.html');
        });

        tu.it('select the body element with findElement', function(){
            var body = driver.findElement('body');

            assert(body);
            assert.equal(body.length, 1);
        });

        tu.it('select 3 divs with findElements', function(){
            var divs = driver.findElements('div.test-div');

            assert.equal(divs.length, 3);
        });

        tu.it('select 1 div with findElement', function(){
            var div = driver.findElements('div.test-div:first');

            assert(div);
            assert.equal(div.length, 1);
        });

        tu.it('select 3 divs with body.find', function(){
            var divs = driver.findElement('body').find('div.test-div');

            assert.equal(divs.length, 3);
        });

        tu.it('select 3 divs with body.findElements', function(){
            var divs = driver.findElement('body').findElements('div.test-div');

            assert.equal(divs.length, 3);
        });

        tu.it('select 3 divs with body.findElement', function(){
            var div = driver.findElement('body').findElement('div.test-div:last');

            assert(div);
            assert.equal(div.length, 1);
        });

        tu.it('error when selecting 3 divs with findElement', function(){
            try {
                driver.findElement('div.test-div');
            } catch(e){
                exceptionOccurred = true;
                assert.equal(e.message, 'Element "div.test-div" found, but there were too many instances (3)');
            }

            assert(exceptionOccurred);
        });

        tu.it('error when selecting a non-existent element with findElement', function(){
            try {
                driver.findElement('.does-not-exist');
            } catch(e){
                exceptionOccurred = true;
                assert.equal(e.message, 'Element ".does-not-exist" not found (timeout: 10)');
            }

            assert(exceptionOccurred);
        });
    });
};