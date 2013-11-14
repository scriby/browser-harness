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
                condition: function(){
                    var check =  $('input[type=checkbox]');
                    return check.is(':focus') || document.activeElement === check[0]; //is(':focus') doesn't work in phantomjs 1.9
                },

                inBrowser: true,

                timeoutMS: 200
            });
        });

        tu.it('blur', function(){
            var check = driver.findVisible('input[type=checkbox]');
            check.focus();

            //Focus is async in IE, so need to wait for changes
            driver.waitFor({
                condition: function(){
                    var check =  $('input[type=checkbox]');
                    return check.is(':focus') || document.activeElement === check[0]; //is(':focus') doesn't work in phantomjs 1.9
                },

                inBrowser: true,

                timeoutMS: 200
            });
            check.blur();

            driver.waitFor({
                condition: function(){
                    var check =  $('input[type=checkbox]');
                    return !check.is(':focus') && document.activeElement !== check[0]; //is(':focus') doesn't work in phantomjs 1.9
                },

                inBrowser: true,

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

        tu.it('innerHeight', function(){
            assert.equal(message.innerHeight(), 0);
        });

        tu.it('outerHeight', function(){
            assert.equal(message.outerHeight(), 0);
        });

        tu.it('width', function(){
            var widthTest = driver.findVisible('#width-test');

            assert(widthTest.width() > 0);

            widthTest.width(20);
            assert.equal(widthTest.width(), 20);

            widthTest.css('width', '');
            assert(widthTest.width() > 0);
        });

        tu.it('innerWidth', function(){
            var widthTest = driver.findVisible('#width-test');

            assert(widthTest.innerWidth() > 0);
        });

        tu.it('outerWidth', function(){
            var widthTest = driver.findVisible('#width-test');

            assert(widthTest.outerWidth() > 0);
        });

        tu.it('offset', function(){
            var widthTest = driver.findVisible('#width-test');

            var offset = widthTest.offset();

            assert(offset.top > 0);
            assert(offset.left > 0);
        });

        tu.it('position', function(){
            var widthTest = driver.findVisible('#width-test');

            var position = widthTest.position();

            assert(position.top > 0);
            assert(position.left > 0);
        });

        tu.it('scrollLeft', function(){
            assert.equal(message.scrollLeft(), 0);
        });

        tu.it('scrollTop', function(){
            assert.equal(message.scrollTop(), 0);
        });

        tu.it('hide show', function(){
            var testDiv = driver.findElement('#test-div');

            assert(testDiv.is(':visible'));

            testDiv.hide();
            assert(!testDiv.is(':visible'));

            testDiv.show();
            assert(testDiv.is(':visible'));
        });

        tu.it('toggle', function(){
            var testDiv = driver.findElement('#test-div');

            assert(testDiv.is(':visible'));

            testDiv.toggle();
            assert(!testDiv.is(':visible'));

            testDiv.toggle();
            assert(testDiv.is(':visible'));
        });

        tu.it('children', function(){
            var children = driver.findVisible('body').children();
            assert(children.length > 0);
        });

        tu.it('closest', function(){
            var body = message.closest('body');

            assert(body);
            assert.equal(body.length, 1);
        });

        tu.it('contents', function(){
            var contents = driver.findVisible('body').children();
            assert(contents.length > 0);
        });

        tu.it('first', function(){
            var input = driver.findVisibles('input').first();
            assert(input);
            assert(input.length === 1);
        });

        tu.it('has', function(){
            var body = driver.findVisibles('body').has('input');

            assert(body);
            assert(body.length === 1);
        });

        tu.it('is', function(){
            var body = driver.findElement('body');

            assert(body.is(':visible'));
        });

        tu.it('last', function(){
            var input = driver.findVisibles('input').last();
            assert(input);
            assert(input.length === 1);
        });

        tu.it('not', function(){
            var div = driver.findVisibles('div').not("#message-container");
            assert(div);
            assert(div.length === 4);
        });

        tu.it('next', function(){
            var input = driver.findVisibles('input').first().next();

            assert(input);
            assert(input.length === 1);
        });

        tu.it('nextAll', function(){
            var inputs = driver.findVisibles('input').nextAll();

            assert(inputs);
            assert(inputs.length > 0);
        });

        tu.it('nextUntil', function(){
            var untilDiv = driver.findVisible('input:first').nextUntil('div');

            assert(untilDiv);
            assert(untilDiv.length > 0);
        });

        tu.it('offsetParent', function(){
            assert.equal(message.offsetParent().attr('id'), driver.findVisible('#message-container').attr('id'));
        });

        tu.it('parent', function(){
            assert.equal(message.parent().attr('id'), driver.findVisible('#message-container').attr('id'));
        });

        tu.it('parents', function(){
            assert.equal(message.parents().length, 3);
        });

        tu.it('parentsUntil', function(){
            assert.equal(message.parentsUntil('html').length, 2);
        });

        tu.it('prev', function(){
            var prevInput = driver.findVisible('input:last').prev();

            assert(prevInput);
            assert.equal(prevInput.length, 1);
        });

        tu.it('prevAll', function(){
            var inputs = driver.findVisibles('input').prevAll();

            assert(inputs);
            assert(inputs.length > 0);
        });

        tu.it('prevUntil', function(){
            var untilDiv = driver.findVisible('input:last').prevUntil('div');

            assert(untilDiv);
            assert(untilDiv.length > 0);
        });

        tu.it('siblings', function(){
            var siblings = driver.findVisible('input:last').siblings();

            assert(siblings.length > 0);
        });

        tu.it('data removeData', function(){
            assert.equal(message.data('test'), null);

            message.data('test', 'test');
            assert.equal(message.data('test'), 'test');

            message.removeData('test');
            assert.equal(message.data('test'), null);
        });

        tu.it('filter', function(){
            var first = driver.findVisibles('input').filter(':first');

            assert(first);
            assert.equal(first.length, 1);
        });

        tu.it('filter function', function(){
            var funcTest = driver.findVisibles('input').filter(function(){
                return $(this).is(':visible');
            });
            assert(funcTest);
            assert(funcTest.length > 0);
        });

        tu.it('append', function(){
            driver.findVisible('body').append('<div class="append-test"></div>');

            var appended = driver.findVisible('.append-test');

            assert(appended);
            assert.equal(appended.length, 1);
        });

        tu.it('find', function(){
            var divs = driver.findVisible('body').find('div');
            assert(divs);
            assert(divs.length > 0);
        });
    });
};