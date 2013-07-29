var tu = require('../test_util.js');
var assert = require('assert');
var asyncblock = require('asyncblock');

exports.setup = function(args){
    describe('When viewing waitfor.html', function(){
        var driver, exceptionOccurred;

        tu.afterEach(function(){
           exceptionOccurred = false;
        });

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/waitfor.html');
        });

        tu.it('waits for a div to appear', function(){
            var flow = asyncblock.getCurrentFlow();

            driver.waitFor({
                func: function() {
                    return $('div.test-div').length > 0;
                },

                timeoutMS: 2000
            }, flow.add('waitFor'));

            flow.sync( setTimeout(flow.add(), 10) );

            driver.exec(function(){
                $('body').append($('<div>test</div>').addClass('test-div'));
            });

            flow.wait('waitFor');

            var div = driver.findVisible('div.test-div');

            assert(div);
            assert.equal(div.length, 1);
        });

        tu.it('times out if the condition is not met', function(){
            var flow = asyncblock.getCurrentFlow();

            driver.waitFor(function(){
                return false;
            }, flow.add({ key: 'waitFor', ignoreError: true }));

            var result = flow.wait('waitFor');

            assert(result instanceof Error);
            assert.equal(result.message.indexOf('waitFor condition timed out'), 0);
        });
    });
};