var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing click.html', function(){
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
        });

        tu.it('.test-button-1 cannot be selected with findVisible', function(){

        });

        tu.it('.test-button-1 cannot be selected with findVisibles', function(){
            ensureHidden('.test-button-1');
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
    });
};