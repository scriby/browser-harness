var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing click.html', function(){
        var driver;

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/visible.html');
        });

        tu.it('.test-button-1 can be found', function(){
            var testButton = driver.findElement('.test-button-1');
            assert(testButton);
        });

        tu.it('.test-button-1 cannot be selected with findVisible', function(){
            var testButton;

            try{
                testButton = driver.findVisible('.test-button-1');
            } catch(e){
                assert.equal(e.message, 'Element ".test-button-1" was found, but is not visible.');
            }

            assert(!testButton);
        });

        tu.it('.test-button-1 cannot be selected with findVisibles', function(){
            var testButton;

            try{
                testButton = driver.findVisibles('.test-button-1');
            } catch(e){
                assert.equal(e.message, 'Element ".test-button-1" was found, but is not visible.');
            }

            assert(!testButton);
        });

        tu.it('.test-button returns one element when selected with findVisibles', function(){
            var testButton = driver.findVisibles('.test-button');

            assert(testButton.length === 1);
        });

        tu.it('.test-link cannot be selected with findVisible', function(){
            var testLink;

            try{
                testLink = driver.findVisible('.test-link');
            } catch(e){
                assert.equal(e.message, 'Element ".test-link" was found, but is not visible.');
            }

            assert(!testLink);
        });

        tu.it('.test-div cannot be selected with findVisible', function(){
            var testDiv;

            try{
                testDiv = driver.findVisible('.test-div');
            } catch(e){
                assert.equal(e.message, 'Element ".test-div" was found, but is not visible.');
            }

            assert(!testDiv);
        });

        tu.it('.test-div-1 cannot be selected with findVisible', function(){
            var testDiv;

            try{
                testDiv = driver.findVisible('.test-div-1');
            } catch(e){
                assert.equal(e.message, 'Element ".test-div-1" was found, but is not visible.');
            }

            assert(!testDiv);
        });

        tu.it('.test-div-2 cannot be selected with findVisible', function(){
            var testDiv;

            try{
                testDiv = driver.findVisible('.test-div-2');
            } catch(e){
                assert.equal(e.message, 'Element ".test-div-2" was found, but is not visible.');
            }

            assert(!testDiv);
        });

        tu.it('.test-div-3 cannot be selected with findVisible', function(){
            var testDiv;

            try{
                testDiv = driver.findVisible('.test-div-3');
            } catch(e){
                assert.equal(e.message, 'Element ".test-div-3" was found, but is not visible.');
            }

            assert(!testDiv);
        });

        tu.it('.test-div-4 cannot be selected with findVisible', function(){
            var testDiv;

            try{
                testDiv = driver.findVisible('.test-div-4');
            } catch(e){
                assert.equal(e.message, 'Element ".test-div-4" was found, but is not visible.');
            }

            assert(!testDiv);
        });
    });
};