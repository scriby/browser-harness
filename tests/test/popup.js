var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing popup.html', function(){
        var driver;

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
            popupDriver.findVisible({ selector: 'button.open-popup', timeoutMS: 1000 });

            driver.clearLastPopupWindow();
            assert.ok(!driver.getLastPopupWindow());

            assert.ok(popup.isOpen());
            popupDriver.findVisible('button.close-self').click();

            driver.waitFor({
                condition: function(){
                    return !popup.isOpen();
                },
                timeoutMS: 500
            });
        });

        tu.it('Opens another popup', function(){
            popupButton = driver.findVisible('button.open-popup-2').click();
            popup = driver.getLastPopupWindow();
            assert.ok(popup != null);
        });
    });
};