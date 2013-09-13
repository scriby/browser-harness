var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args) {
    describe('When viewing knockout.html', function() {
        var driver;
        tu.it('loads the url', function() {
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/knockout.html');
        });

        tu.it('textboxes have the correct initial values', function() {
            var first = driver.findVisible('#first');
            var second = driver.findVisible('#second');
            assert.equal(first.val(), 'initialVal');
            assert.equal(second.val(), 'initialVal');
        });

        tu.it('textbox handles change properly', function() {
            var changable = driver.findVisible('#changable');
            changable.trigger('change');
            driver.waitFor({
                condition: function() {
                    return $('#status').val() === 'changed';
                },
                inBrowser: true
            });

            assert.equal(driver.findVisible('#status').val(), 'changed');
        });

        tu.it('ko bound textboxes update the values correctly', function() {
            var first = driver.findVisible('#first');
            assert.equal(first.val(), 'initialVal');
            assert.equal(first.setText('newVal').val(), 'newVal');
            assert.equal(driver.findVisible('#second').val(), 'newVal');
        });

        tu.it('ko bound dropdowns have the correct initial values', function() {
            assert.equal(driver.findVisible('#noValStatus').val(), 'One');
            assert.equal(driver.findVisible('#withValStatus').val(), '1');
        });

        tu.it('setting ko bound dropdowns by text updates correctly', function() {
            driver.findVisible('#dropdownNoValues').selectDropdownByText('Two');
            driver.waitFor(function() {
                return driver.findVisible('#noValStatus').val() === 'Two';
            });

            driver.findVisible('#dropdownWithValues').selectDropdownByText('Two');
            driver.waitFor(function() {
                return driver.findVisible('#withValStatus').val() === '2';
            });
        });

        tu.it('setting ko bound dropdowns by value updates correctly', function() {
            driver.findVisible('#dropdownNoValues').selectDropdownByValue('Three');
            driver.waitFor(function() {
                return driver.findVisible('#noValStatus').val() === 'Three';
            });

            driver.findVisible('#dropdownWithValues').selectDropdownByValue('3');
            driver.waitFor(function() {
                return driver.findVisible('#withValStatus').val() === '3';
            });
        });

        tu.it('setting ko bound dropdowns by index updates correctly', function() {
            driver.findVisible('#dropdownNoValues').selectDropdownByIndex(3);
            driver.waitFor(function() {
                return driver.findVisible('#noValStatus').val() === 'Four';
            });

            driver.findVisible('#dropdownWithValues').selectDropdownByIndex(3);
            driver.waitFor(function() {
                return driver.findVisible('#withValStatus').val() === '4';
            });
        })
    });
};