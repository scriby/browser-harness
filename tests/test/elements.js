var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing elements.html', function(){
        var driver, message;

        tu.afterEach(function(){
            message.html('');
        });

        tu.it('loads the URL', function(){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/elements.html');
            message = driver.findVisible('#message');
        });

        tu.it('focus', function(){
            var check = driver.findVisible('input[type=checkbox]');
            assert.equal(check.is(':focus'), false);
            check.focus();

            //Focus is async in IE, so need to wait for changes
            driver.waitFor({
                func: function(){
                    var check =  $('input[type=checkbox]');
                    return check.is(':focus') || document.activeElement === check[0]; //is(':focus') doesn't work in phantomjs 1.9
                },

                timeoutMS: 200
            });
        });

        tu.it('blur', function(){
            var check = driver.findVisible('input[type=checkbox]');
            check.focus();

            //Focus is async in IE, so need to wait for changes
            driver.waitFor({
                func: function(){
                    var check =  $('input[type=checkbox]');
                    return check.is(':focus') || document.activeElement === check[0]; //is(':focus') doesn't work in phantomjs 1.9
                },

                timeoutMS: 200
            });
            check.blur();

            driver.waitFor({
                func: function(){
                    var check =  $('input[type=checkbox]');
                    return !check.is(':focus') && document.activeElement !== check[0]; //is(':focus') doesn't work in phantomjs 1.9
                },

                timeoutMS: 200
            });
        });

        tu.it('val', function(){
            var text = driver.findVisible('input[type=text]');
            assert.equal(text.val(), '');

            text.val('test');

            assert.equal(text.val(), 'test');
        });

        tu.it('attr', function(){
            var text = driver.findVisible('input[type=text]');
            assert.equal(text.attr('class') || '', '');

            text.attr('class', 'test');

            assert.equal(text.attr('class'), 'test');
        });

        tu.it('removeAttr', function(){
            var text = driver.findVisible('input[type=text]');

            text.attr('class', 'test');
            assert.equal(text.attr('class'), 'test');

            text.removeAttr('class');

            assert.equal(text.attr('class') || '', '');
        });

        tu.it('prop', function(){
            var check = driver.findVisible('input[type=checkbox]');
            assert.equal(check.prop('checked'), false);

            check.prop('checked', true);

            assert.equal(check.prop('checked'), true);
        });

        tu.it('removeProp', function(){
            var check = driver.findVisible('input[type=checkbox]');

            check.prop('checked', true);
            assert.equal(check.prop('checked'), true);

            check.removeProp('checked');

            assert.equal(check.prop('checked') || null, null); //phantomjs returns false, chrome returns null
        });

        tu.it('html', function(){
            assert.equal(message.html(), '');

            message.html('test');

            assert.equal(message.html(), 'test');
        });

        tu.it('text', function(){
            assert.equal(message.text(), '');

            message.text('test');

            assert.equal(message.text(), 'test');
        });

        tu.it('hasClass addClass removeClass', function(){
            assert.equal(message.hasClass('test'), false);

            message.addClass('test');
            assert.equal(message.hasClass('test'), true);

            message.removeClass('test');
            assert.equal(message.hasClass('test'), false);
        });

        tu.it('toggleClass', function(){
            assert.equal(message.hasClass('test'), false);

            message.toggleClass('test');
            assert.equal(message.hasClass('test'), true);

            message.toggleClass('test');
            assert.equal(message.hasClass('test'), false);
        });

        tu.it('trigger', function(){
            driver.findVisible('button').trigger('click');

            assert.equal(message.html(), 'button clicked');
        });

        tu.it('triggerHandler', function(){
            driver.findVisible('button').trigger('click');

            assert.equal(message.html(), 'button clicked');
        });

        tu.it('css', function(){
            assert.equal(message.css('display'), 'block');

            message.css('display', 'none');
            assert.equal(message.css('display'), 'none');

            message.css('display', '');
            assert.equal(message.css('display'), 'block');
        });

        tu.it('height', function(){
            assert.equal(message.height(), 0);

            message.height(20);
            assert.equal(message.height(), 20);

            message.css('height', '');
            assert.equal(message.height(), 0);
        });
    });
};