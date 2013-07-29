var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing click.html', function(){
        var driver, message, exceptionOccurred;

        tu.afterEach(function(){
            message.html('');
            exceptionOccurred = false;
        });

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/click.html');
            message = driver.findVisible('#message');
        });

        tu.it('clicking a button works', function(){
            driver.findVisible('.test-button').click();
            assert.equal(message.html(), 'test-button clicked');
        });

        tu.it('clicking a link works', function(){
            driver.findVisible('.test-link').click();
            assert.equal(message.html(), 'test-link clicked');
        });

        tu.it('cannot click a disabled button', function(){
            var testButton = driver.findVisible('.test-button-disabled');
            try{
                testButton.click();
            } catch(e){
                exceptionOccurred = true;
            }

            assert.equal(message.html(), '');
            assert(exceptionOccurred);
        });

        tu.it('cannot click a hidden link', function(){
            var testLink = driver.findElement('.test-link-hidden');
            try{
                testLink.click();
            } catch(e){
                exceptionOccurred = true;
            }

            assert(exceptionOccurred);
            assert.equal(message.html(), '');
        });
    });
};