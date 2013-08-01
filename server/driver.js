var events = require('events');

var config = require('./config.js');

var asyncblock;
try{
    //Use asyncblock to manage flow control if it's available
    asyncblock = require('asyncblock');
} catch(e){ }

var ElementProxy = require('./element_proxy.js');

var Driver = function(now){
    this.now = now;
    this.events = new events.EventEmitter();
};

Driver.prototype._convertArguments = function(args){
    for(var i = 0; i < args.length; i++){
        var item = args[i];

        if(item && item.isElementArray){
            var elements = item.elements || [];
            elements.__proto__ = ElementProxy.prototype;
            elements.driver = this;

            args[i] = elements;
        } else if(item && item.isElementProxy){
            var array = [ item ];
            array.__proto__ = ElementProxy.prototype;
            array.driver = this;

            args[i] = array;
        }
    }
};

Driver.prototype.exec = function(args, callback){
    var self = this;
    var func, funcArgs;

    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.exec(args, flow.add()) );
        }
    }

    if(args.func){
        func = args.func;
        funcArgs = args.args;
    } else {
        func = args;
    }

    this.now.exec(
        {
            func: func.toString(),
            args: funcArgs
        },

        function(err){
            self._convertArguments(arguments);

            callback && callback.apply(err, arguments)
        }
    );
};

Driver.prototype.setUrl = function(url, callback){
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.setUrl(url, flow.add()) );
        }
    }

    if(callback == null){
        throw new Error('callback is required');
    }

    this.now.setUrl(url, callback);
};

Driver.prototype.waitFor = function(args, callback){
    var self = this;
    var startTime;
    var func;
    var timeout;
    if(typeof args === 'object'){
        func = args.func;
        startTime = args.startTime || new Date();
        timeout = args.timeoutMS || config.timeoutMS;
    } else {
        func = args;
        startTime = new Date();
        timeout = config.timeoutMS;
    }

    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.waitFor(args, flow.add()) );
        }
    }

    if(callback == null){
        throw new Error('callback is required');
    }

    this.exec(args, function(err, result){
        if(err){
            return callback(err);
        }

        if(result){
            return callback();
        } else {
            if(new Date() - startTime < timeout){
                setTimeout(function(){
                    self.waitFor({ func: func, timeoutMS: timeout, startTime: startTime }, callback);
                }, config.retryMS);
            } else {
                return callback(new Error('waitFor condition timed out (' + timeout + '): "' + func.toString()));
            }
        }
    });
};

Driver.prototype.findElement = function(args, callback){
    var self = this;
    var startTime, selector, context, multi;
    if(typeof args === 'object'){
        selector = args.selector;
        startTime = args.startTime || new Date();
        context = args.context;
        multi = args.multi;
    } else {
        selector = args;
        startTime = new Date();
        multi = false;
    }

    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.findElement(args, flow.add()) );
        }
    }

    if(callback == null){
        throw new Error('callback is required');
    }

    this.exec({
        func: function(args){
            return $(args.selector, args.context);
        },

        args: { selector: selector, context: context }
    }, function(err, element){
        if(err){
            return callback(err);
        }

        if(element && (element.length === 1 || (multi && element.length > 0))) {
           callback(null, element);
        } else {
            if(new Date() - startTime < config.timeoutMS){
                setTimeout(function(){
                   self.findElement({ selector: selector, context: context, startTime: startTime, multi: multi }, callback);
                }, config.retryMS);
            } else {
                if(element && element.length > 1){
                    return callback(new Error('Element "' + selector + '" found, but there were too many instances (' + element.length + ')'));
                } else {
                    return callback(new Error('Element "' + selector + '" not found'));
                }
            }
        }
    });
};

Driver.prototype.findElements = Driver.prototype.find = function(args, callback){
    if(typeof args === 'object'){
        args.multi = true;
    } else {
        args = { selector: args, multi: true };
    }

    return this.findElement(args, callback);
};

var _isVisible = function(element, selector, startTime, callback){
    //Select not-disabled elements instead of enabled elements because only certain types of elements can be enabled
    //For instance, anchor tags cannot be enabled - so they will always fail an enabled check
    element._filterVisible(function(err, visibleElements){
        if(err) {
            return callback(err);
        }

        //Not all the elements are visible, return the visible ones
        if(visibleElements && visibleElements.length > 0){
            callback(null, visibleElements);
        } else {
            if(new Date() - startTime < config.timeoutMS){
                setTimeout(function(){
                   _isVisible(element, selector, startTime, callback);
                }, config.retryMS);
            } else {
                return callback(new Error('Element "' + selector + '" was found, but is not visible.'));
            }
        }
    });
};

Driver.prototype.findVisible = function(args, callback){
    var selector;
    if(typeof args === 'object'){
        selector = args.selector;
    } else {
        args = { selector: args, multi: false };
    }

    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.findVisible(args, flow.add()) );
        }
    }

    if(callback == null){
        throw new Error('callback is required');
    }

    this.findElement(args, function(err, element){
        if(err){
            return callback(err);
        }

        _isVisible(element, selector, new Date(), callback);
    });
};

Driver.prototype.findVisibles = function(args, callback){
    if(typeof args === 'object'){
        args.multi = true;
    } else {
        args = { selector: args, multi: true };
    }

    return this.findVisible(args, callback);
};

module.exports = Driver;