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
            driver.waitFor({
                condition: function() {
                    return $('div.test-div').length > 0;
                },

                exec: function(){
                    $('body').append($('<div>test</div>').addClass('test-div'));
                },

                timeoutMS: 2000
            });

            var div = driver.findVisible('div.test-div');

            assert(div);
            assert.equal(div.length, 1);
        });

        tu.it('times out if the condition is not met', function(){
            var flow = asyncblock.getCurrentFlow();

            driver.waitFor({
                condition: function(){
                    return false;
                },

                timeoutError: 'test error'
            }, flow.add({ key: 'waitFor', ignoreError: true }));

            var result = flow.wait('waitFor');

            assert(result instanceof Error);
            assert.equal('waitFor condition timed out (10): test error', result.message);
        });

        tu.it('passes variables to waitFor', function(){
            var body = driver.findVisible('body');
            driver.exec({
                func: function(){
                    $('body').append($('<div>test</div>').addClass('test-div-1'));
                },

                args: body
            });

            var element = driver.findVisible('.test-div-1');

            driver.waitFor({
                condition: function(element) {
                    return element.is(':hidden');
                },

                exec: function(element){
                    element.hide();
                },

                timeoutMS: 2000,

                args: element
            });

            var div = driver.findElement('div.test-div-1:hidden');

            assert(div);
            assert.equal(div.length, 1);
        });
    });
};