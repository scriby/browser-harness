var tu = require('../test_util.js');
var assert = require('assert');
var config = require('../../server/config.js');

exports.setup = function(args){
    describe('When viewing popup.html', function(){
        var driver, _originalTimeout;

        before(function(){
            _originalTimeout = config.timeoutMS;
            config.timeoutMS = 1000;
        });

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/popup.html');
        });

        tu.it('Opens a popup', function(){
            var popupButton = driver.findVisible('button.open-popup').click();

            var popup = driver.getLastPopupWindow();

            assert.ok(popup != null);

            //Remove the open-popup class to make sure we aren't interacting with this page on the next test
            popupButton.removeClass('open-popup');
            assert.ok(!popupButton.hasClass('open-popup'));

            var popupDriver = popup.getDriver();
            popupDriver.findVisible('button.open-popup');

            driver.clearLastPopupWindow();
            assert.ok(!driver.getLastPopupWindow());

            assert.ok(popup.isOpen());
            popupDriver.findVisible('button.close-self').click();

            driver.waitFor(function(){
                return !popup.isOpen();
            });
        });

        tu.it('Opens another popup', function(){
            popupButton = driver.findVisible('button.open-popup-2').click();
            popup = driver.getLastPopupWindow();
            assert.ok(popup != null);
        });

        after(function(){
            config.timeoutMS = _originalTimeout;
        });
    });
};