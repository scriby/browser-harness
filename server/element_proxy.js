//Use asyncblock to manage flow control if it's available
var asyncblock = process.__asyncblock_included__;

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

                if(!elements._isActionable()){
                    throw new Error('Element(s) are not actionable. ' + args.func + ' failed.');
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

ElementProxy.prototype.closest = function(callback){
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

ElementProxy.prototype.isActionable = function(callback){
    return this._exec({ func: 'isActionable', args: arguments });
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

ElementProxy.prototype.selectByText = function(text, callback) {
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.setText(text, flow.add()) );
        }
    }

    return this.find('option', function(err, result) {
        if (err) { return callback(err); }

        var iterate = function(el) {
            if (!el || !el.length) {
                return callback();
            }

            return el.text(function(err, result) {
                if (err) { return callback(err); }

                if (result === text) {
                    return el.prop('selected', true, callback);
                } else {
                    return el.next(function(err, result) {
                        if (err) { return callback(err); }

                        return iterate(result);
                    });
                }
            });
        };

        return result.first(function(err, result) {
            if (err) { return callback(err); }

            return iterate(result);
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

        if (result.is('input[type=text], textarea'), function(err, isTextField) {
            if (err) { return callback(err); }

            var setter = 'text';
            if (isTextField) {
                setter = 'val'
            }

            // set the element value
            return result.[setter](text, function(err, result) {
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

module.exports = ElementProxy;