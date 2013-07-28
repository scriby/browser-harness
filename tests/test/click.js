var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing click.html', function(){
        var driver, message;

        tu.beforeEach(function(){
            message && message.html('');
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

        tu.it('clicking a disabled button throws an exception and has no effect', function(){
            var testButton = driver.findVisible('.test-button').attr('disabled', 'true');
            try{
                testButton.click();
            } catch(e){
                assert.equal(e.message.indexOf('Error: Element(s) are disabled. click failed.'), 0);
            }

            assert.equal(message.html(), '');
        });
    });
};