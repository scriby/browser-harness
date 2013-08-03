var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing simple.html', function(){
        var driver;

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/simple.html');
        });

        tu.it('clicks on transition', function(){
            driver.findVisible('a').click();

            driver.waitFor({
                condition: function(){
                    return location.href.indexOf('/transition.html') >= 0;
                },
                timeoutMS: 5000
            });
        });

        tu.it('Finds transition h1', function(){
            var h1 = driver.findVisible('h1');
            assert.equal(h1.length, 1);
            assert(h1.html(), 'Transition');
        });
    });
};