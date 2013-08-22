var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args) {
    describe('When viewing knockout.html', function() {
        var driver;
        tu.it('loads the url', function() {
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/knockout.html');
        });

        tu.it('has the correct initial values', function() {
            var first = driver.findVisible('#first');
            var second = driver.findVisible('#second');
            assert.equal(first.val(), 'initialVal');
            assert.equal(second.val(), 'initialVal');
        });

        tu.it('handles change properly', function() {
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

        tu.it('updates the value correctly', function() {
            var first = driver.findVisible('#first');
            assert.equal(first.val(), 'initialVal');
            assert.equal(first.setText('newVal').val(), 'newVal');
            assert.equal(driver.findVisible('#second').val(), 'newVal');
        });
    });
};