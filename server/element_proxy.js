var ElementProxy = function(driver){
    this.driver = driver;
};

ElementProxy.prototype._exec = function(args, callback){
    var funcArgs = Array.prototype.slice.call(args.args, 0); //Convert from Arguments object to Array object
    var potentialCallback = funcArgs[funcArgs.length - 1];
    if(typeof potentialCallback === 'function'){
        callback = potentialCallback;
        delete funcArgs[funcArgs.length - 1];
        funcArgs.length--;
    }

    return this.driver.exec({
        func: function(args){
            var result;

            var elements = $(args.elements);

            result = elements[args.func].apply(elements, args.funcArgs);

            return result;
        },

        args: {
            func: args.func,
            funcArgs: funcArgs,
            elements: this //this.driver does not show up in the serialized version of this (probably b/c it's an array)
        }
    }, callback);
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




module.exports = ElementProxy;