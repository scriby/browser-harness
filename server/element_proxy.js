//Use asyncblock to manage flow control if it's available
var asyncblock = process.__asyncblock_included__;
var config = require('./config.js');

var ElementProxy = function(driver){
    this.driver = driver;
    this.isElementProxy = true;
};

ElementProxy.prototype._exec = function(args, callback){
    var funcArgs = Array.prototype.slice.call(args.args, 0); //Convert from Arguments object to Array object
    var potentialCallback = funcArgs[funcArgs.length - 1];
    if(typeof potentialCallback === 'function'){
        callback = potentialCallback;
        delete funcArgs[funcArgs.length - 1];
        funcArgs.length--;
    }

    //Click has to be special cased. "Click"-ing an anchor using jQuery triggers the handlers, but does not follow the link
    if(args.func === 'click'){
        return this.driver.exec({
            func: function(args){
                var elements = args.elements;

                //Make sure the element is still in the DOM
                for(var i = 0; i < elements.length; i++){
                    if(!jQuery.contains(document.documentElement, elements[i])){
                        throw new Error('Element does not exist in the DOM. ' + args.func + ' failed.');
                    }
                }

                if(elements.is(':disabled')){
                    throw new Error('Element(s) are disabled. ' + args.func + ' failed.');
                }

                if(elements._filterVisible().length !== elements.length){
                    throw new Error('Element(s) are not visible. ' + args.func + ' failed.');
                }

                var element = elements[0];
                if(element.click){
                    element.click();
                } else {
                    //Workaround for browsers that don't allow anchors to be clicked, such as phantomjs
                    var evObj = document.createEvent('Events');
                    evObj.initEvent('click', true, false);
                    element.dispatchEvent(evObj);
                }

                return elements;
            },

            args: {
                func: args.func,
                funcArgs: funcArgs,
                elements: this
            }
        }, callback);
    } else {
        return this.driver.exec({
            func: function(args){
                var result;
                var elements = args.elements;

                //An exception is made for filterVisible because it is used when selecting elements
                //It's possible that we select an element, then check its visibility, and it's gone from the DOM at that point
                //Instead of erroring, we want to continue to try to select the element
                if(args.func !== '_filterVisible'){
                    //Make sure the element is still in the DOM
                    for(var i = 0; i < elements.length; i++){
                        if(!jQuery.contains(document.documentElement, elements[i])){
                            throw new Error('Element does not exist in the DOM. ' + args.func + ' failed.');
                        }
                    }
                }

                result = elements[args.func].apply(elements, args.funcArgs);
                return result;
            },

            args: {
                func: args.func,
                funcArgs: funcArgs,
                elements: this //this.driver does not show up in the serialized version of this (probably b/c it's an array)
            }
        }, callback);
    }
};

ElementProxy.prototype.click = function(callback){
    return this._exec({ func: 'click', args: arguments });
};

ElementProxy.prototype.dblclick = function(callback){
    return this._exec({ func: 'dblclick', args: arguments });
};

ElementProxy.prototype.focus = function(callback){
    return this._exec({ func: 'focus', args: arguments });
};

ElementProxy.prototype.blur = function(callback){
    return this._exec({ func: 'blur', args: arguments });
};

ElementProxy.prototype.val = function(value, callback){
    return this._exec({ func: 'val', args: arguments });
};

ElementProxy.prototype.attr = function(name, value, callback){
    return this._exec({ func: 'attr', args: arguments });
};

ElementProxy.prototype.removeAttr = function(name, callback){
    return this._exec({ func: 'removeAttr', args: arguments });
};

ElementProxy.prototype.prop = function(name, value, callback){
    return this._exec({ func: 'prop', args: arguments });
};

ElementProxy.prototype.removeProp = function(name, callback){
    return this._exec({ func: 'removeProp', args: arguments });
};

ElementProxy.prototype.html = function(value, callback){
    return this._exec({ func: 'html', args: arguments });
};

ElementProxy.prototype.text = function(value, callback){
    return this._exec({ func: 'text', args: arguments });
};

ElementProxy.prototype.hasClass = function(className, callback){
    return this._exec({ func: 'hasClass', args: arguments });
};

ElementProxy.prototype.addClass = function(className, callback){
    return this._exec({ func: 'addClass', args: arguments });
};

ElementProxy.prototype.removeClass = function(className, callback){
    return this._exec({ func: 'removeClass', args: arguments });
};

ElementProxy.prototype.toggleClass = function(className, callback){
    return this._exec({ func: 'toggleClass', args: arguments });
};


ElementProxy.prototype.trigger = function(event, extraParameters, callback){
    return this._exec({ func: 'trigger', args: arguments });
};

ElementProxy.prototype.triggerHandler = function(event, extraParameters, callback){
    return this._exec({ func: 'triggerHandler', args: arguments });
};


ElementProxy.prototype.css = function(name, value, callback){
    return this._exec({ func: 'css', args: arguments });
};

ElementProxy.prototype.height = function(value, callback){
    return this._exec({ func: 'height', args: arguments });
};

ElementProxy.prototype.innerHeight = function(value, callback){
    return this._exec({ func: 'innerHeight', args: arguments });
};

ElementProxy.prototype.outerHeight = function(value, callback){
    return this._exec({ func: 'outerHeight', args: arguments });
};

ElementProxy.prototype.width = function(value, callback){
    return this._exec({ func: 'width', args: arguments });
};

ElementProxy.prototype.innerWidth = function(value, callback){
    return this._exec({ func: 'innerWidth', args: arguments });
};

ElementProxy.prototype.outerWidth = function(value, callback){
    return this._exec({ func: 'outerWidth', args: arguments });
};

ElementProxy.prototype.offset = function(value, callback){
    return this._exec({ func: 'offset', args: arguments });
};

ElementProxy.prototype.position = function(value, callback){
    return this._exec({ func: 'position', args: arguments });
};

ElementProxy.prototype.scrollLeft = function(value, callback){
    return this._exec({ func: 'scrollLeft', args: arguments });
};

ElementProxy.prototype.scrollTop = function(value, callback){
    return this._exec({ func: 'scrollTop', args: arguments });
};


ElementProxy.prototype.hide = function(callback){
    return this._exec({ func: 'hide', args: arguments });
};

ElementProxy.prototype.show = function(callback){
    return this._exec({ func: 'show', args: arguments });
};

ElementProxy.prototype.toggle = function(callback){
    return this._exec({ func: 'toggle', args: arguments });
};


ElementProxy.prototype.children = function(callback){
    return this._exec({ func: 'children', args: arguments });
};

ElementProxy.prototype.closest = function(selector, callback){
    return this._exec({ func: 'closest', args: arguments });
};

ElementProxy.prototype.contents = function(callback){
    return this._exec({ func: 'contents', args: arguments });
};

ElementProxy.prototype.find = ElementProxy.prototype.findElements = function(selector, callback){
    return this.driver.find({ selector: selector, context: this }, callback);
};

ElementProxy.prototype.findElement = function(selector, callback){
    return this.driver.findElement({ selector: selector, context: this }, callback);
};

ElementProxy.prototype.findVisible = function(selector, callback){
    return this.driver.findVisible({ selector: selector, context: this }, callback);
};

ElementProxy.prototype.findVisibles = function(selector, callback){
    return this.driver.findVisibles({ selector: selector, context: this }, callback);
};

ElementProxy.prototype._filterVisible = function(callback){
    return this._exec({ func: '_filterVisible', args: arguments });
};

ElementProxy.prototype.first = function(callback){
    return this._exec({ func: 'first', args: arguments });
};

ElementProxy.prototype.has = function(arg, callback){
    return this._exec({ func: 'has', args: arguments });
};

ElementProxy.prototype.is = function(arg, callback){
    return this._exec({ func: 'is', args: arguments });
};

ElementProxy.prototype.last = function(callback){
    return this._exec({ func: 'last', args: arguments });
};

ElementProxy.prototype.next = function(selector, callback){
    return this._exec({ func: 'next', args: arguments });
};

ElementProxy.prototype.nextAll = function(selector, callback){
    return this._exec({ func: 'nextAll', args: arguments });
};

ElementProxy.prototype.nextUntil = function(selector, callback){
    return this._exec({ func: 'nextUntil', args: arguments });
};

ElementProxy.prototype.offsetParent = function(callback){
    return this._exec({ func: 'offsetParent', args: arguments });
};

ElementProxy.prototype.parent = function(selector, callback){
    return this._exec({ func: 'parent', args: arguments });
};

ElementProxy.prototype.parents = function(selector, callback){
    return this._exec({ func: 'parents', args: arguments });
};

ElementProxy.prototype.parentsUntil = function(selector, callback){
    return this._exec({ func: 'parentsUntil', args: arguments });
};

ElementProxy.prototype.prev = function(selector, callback){
    return this._exec({ func: 'prev', args: arguments });
};

ElementProxy.prototype.prevAll = function(selector, callback){
    return this._exec({ func: 'prevAll', args: arguments });
};

ElementProxy.prototype.prevUntil = function(selector, callback){
    return this._exec({ func: 'prevUntil', args: arguments });
};

ElementProxy.prototype.siblings = function(selector, callback){
    return this._exec({ func: 'siblings', args: arguments });
};

ElementProxy.prototype.eq = function(index, callback) {
    return this._exec({ func: 'eq', args: arguments });
};


ElementProxy.prototype.data = function(name, value, callback){
    return this._exec({ func: 'data', args: arguments });
};

ElementProxy.prototype.removeData = function(name, callback){
    return this._exec({ func: 'removeData', args: arguments });
};


ElementProxy.prototype.append = function(content, callback){
    return this._exec({ func: 'append', args: arguments });
};


ElementProxy.prototype.filter = function(selector, callback){
    return this._exec({ func: 'filter', args: arguments });
};

ElementProxy.prototype.selectDropdownByText = function(args, callback) {
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.selectDropdownByText(args, flow.add()) );
        }
    }

    var text, startTime, timeoutMS;
    if(args && typeof args === 'object'){
        text = args.text;
        startTime = args.startTime || new Date();
        timeoutMS = args.timeoutMS;
    } else {
        text = args;
        startTime = new Date();
        timeoutMS = config.timeoutMS;
    }

    var self = this;
    this.driver.exec({
        func: function(args){
            var dropdown = args.dropdown;
            var optionFound = false;

            dropdown.find('option').each(function(){
                var $this = $(this);
                if($this.text() === args.text){
                    dropdown.val($this.val());
                    dropdown.change();

                    optionFound = true;

                    return false; //Stop iterating
                }
            });

            if(!optionFound){
                throw new Error('Dropdown option not found by text: ' + args.text);
            }
        },

        args: { dropdown: this, text: text }
    }, function(err){
        if(err && err.indexOf && err.indexOf('Dropdown option not found by text') >= 0){
            if(new Date() - startTime < timeoutMS){
                setTimeout(function(){
                    self.selectDropdownByText({ text: text, startTime: startTime, timeoutMS: timeoutMS }, callback);
                }, config.retryMS);

                return;
            }
        }

        callback(err, self);
    });
};

ElementProxy.prototype.selectDropdownByValue = function(args, callback) {
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.selectDropdownByValue(args, flow.add()) );
        }
    }

    var value, startTime, timeoutMS;
    if(args && typeof args === 'object'){
        value = args.value;
        startTime = args.startTime || new Date();
        timeoutMS = args.timeoutMS;
    } else {
        value = args;
        startTime = new Date();
        timeoutMS = config.timeoutMS;
    }

    var self = this;
    this.driver.exec({
        func: function(args){
            var dropdown = args.dropdown;
            var optionFound = false;

            dropdown.find('option').each(function(){
                var $this = $(this);
                if($this.val() === args.value){
                    dropdown.val($this.val());
                    dropdown.change();

                    optionFound = true;

                    return false; //Stop iterating
                }
            });

            if(!optionFound){
                throw new Error('Dropdown option not found by value: ' + args.value);
            }
        },

        args: { dropdown: this, value: value }
    }, function(err){
        if(err && err.indexOf && err.indexOf('Dropdown option not found by value') >= 0){
            if(new Date() - startTime < timeoutMS){
                setTimeout(function(){
                    self.selectDropdownByValue({ value: value, startTime: startTime, timeoutMS: timeoutMS }, callback);
                }, config.retryMS);

                return;
            }
        }

        callback(err, self);
    });
};

ElementProxy.prototype.selectDropdownByIndex = function(index, callback) {
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.selectDropdownByIndex(index, flow.add()) );
        }
    }

    var dropdown = this;
    return this.find('option:nth-child(' + (index + 1) + ')', function(err, result) {
        if (err) { return callback(err); }

        if(result.length === 0){
            return callback('Dropdown option not found by index: ' + index);
        }

        return result.val(function(err, result) {
            if (err) { return callback(err); }

            return dropdown.selectDropdownByValue(result, callback);
        });
    });
};

ElementProxy.prototype.change = function(callback) {
    return this._exec({ func: 'change', args: arguments });
};

ElementProxy.prototype.setText = function(text, callback) {
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.setText(text, flow.add()) );
        }
    }

    // focus the current element
    return this.focus(function(err, result) {
        if (err) { return callback(err); }

        result.is('input[type=text], textarea', function(err, isTextField) {
            if (err) { return callback(err); }

            var setter = 'text';
            if (isTextField) {
                setter = 'val'
            }

            // set the element value
            return result[setter](text, function(err, result) {
                if (err) { return callback(err); }

                // blur the element to trigger any events that may happen when text is entered
                return result.blur(function(err, result) {
                    if (err) { return callback(err); }

                    // manually fire the change event (needed for knockout support)
                    return result.change(callback);
                });
            });
        });
    });
};

ElementProxy.prototype.sendEnterKey = function(callback) {
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.sendEnterKey(flow.add()) );
        }
    }

    var self = this;
    return this.driver.exec({
        func: function(el) {
            var evt = $.Event('keypress');
            evt.which = evt.keyCode = 13; // the key code for the enter key
            el.trigger(evt);
        },
        args: this
    }, function(err) {
        return callback(err, self);
    });
};

ElementProxy.prototype.waitUntil = function(selector, callback){
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.waitUntil(selector, flow.add()) );
        }
    }

    var self = this;

    return this.driver.waitFor(function(){
        return self.is(selector);
    }, function(err){
        callback(err, self);
    });
};

module.exports = ElementProxy;