var tu = require('../test_util.js');
var assert = require('assert');
var asyncblock = require('asyncblock');

exports.setup = function(args){
    describe('When viewing visible.html', function(){
        var driver, exceptionOccurred;

        var ensureHidden = function(selector){
            var control;

            try{
                control = driver.findVisible(selector);
            } catch(e){
                exceptionOccurred = true;
                assert.equal(e.message, 'Element "' + selector + '" was found, but is not visible.');
            }

            assert(exceptionOccurred);
            assert(!control);
        };

        tu.afterEach(function(){
           exceptionOccurred = false;
        });

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/visible.html');
        });

        tu.it('.test-button-1 can be found', function(){
            var testButton = driver.findElement('.test-button-1');

            assert(testButton);
            assert(testButton.length, 1);
        });

        tu.it('.test-button:first can be found using body.findVisible', function(){
            var testButton = driver.findElement('body').findVisible('.test-button:first');
            assert(testButton);
            assert(testButton.length, 1);
        });

        tu.it('.test-button can be found using body.findVisibles', function(){
            var testButton = driver.findElement('body').findVisibles('.test-button');
            assert(testButton);
            assert(testButton.length, 1);
        });

        tu.it('.test-button-1 cannot be selected with findVisible', function(){
            ensureHidden('.test-button-1');
        });

        tu.it('.test-button-1 cannot be selected with findVisibles', function(){
            var control;
            var selector = '.test-button-1';

            try{
                control = driver.findVisibles(selector);
            } catch(e){
                exceptionOccurred = true;
                assert.equal(e.message, 'Element "' + selector + '" was found, but is not visible.');
            }

            assert(exceptionOccurred);
            assert(!control);
        });

        tu.it('.test-button returns one element when selected with findVisibles', function(){
            var testButton = driver.findVisibles('.test-button');

            assert(testButton.length === 1);
        });

        tu.it('.test-link cannot be selected with findVisible', function(){
            ensureHidden('.test-link');
        });

        tu.it('.test-div cannot be selected with findVisible', function(){
            ensureHidden('.test-div');
        });

        tu.it('.test-div-1 cannot be selected with findVisible', function(){
            ensureHidden('.test-div-1');
        });

        tu.it('.test-div-2 cannot be selected with findVisible', function(){
            ensureHidden('.test-div-2');
        });

        tu.it('.test-div-3 cannot be selected with findVisible', function(){
            ensureHidden('.test-div-3');
        });

        tu.it('.test-div-4 cannot be selected with findVisible', function(){
            ensureHidden('.test-div-4');
        });

        tu.it('.multi can be selected with findVisible', function(){
            var multi = driver.findVisible('.multi');

            assert(multi.length === 1);
        });

        tu.it('If a different visible matching element exists later, it will be found', function(){
            process.nextTick(function(){
                asyncblock(function(){
                    driver.findVisible('body').append('<div class="test-div-5 added-later"></div>');
                })
            });

            var testDiv = driver.findVisible('.test-div-5');
            assert.ok(testDiv.hasClass('added-later'));
        })
    });
};