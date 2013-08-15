var events = require('events');

var config = require('./config.js');

//Use asyncblock to manage flow control if it's available
var asyncblock = process.__asyncblock_included__;

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
    var startTime, func, timeout, exec, funcArgs, timeoutError, inBrowser;
    if(typeof args === 'object'){
        func = args.condition;
        startTime = args.startTime || new Date();
        timeout = args.timeoutMS || config.timeoutMS;
        exec = args.exec;
        funcArgs = args.args;
        timeoutError = args.timeoutError;
        inBrowser = args.inBrowser;
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

    var _resultHandler = function(err, result){
        if(err){
            return callback(err);
        }

        if(result){
            return callback();
        } else {
            if(new Date() - startTime < timeout){
                setTimeout(function(){
                    //Need to re-create the asyncblock context
                    (asyncblock || function(fn){ fn(); })(function(){
                        self.waitFor({
                            condition: func,
                            timeoutMS: timeout,
                            startTime: startTime,
                            args: funcArgs,
                            timeoutError: timeoutError,
                            inBrowser: inBrowser
                        }, callback);
                    });
                }, config.retryMS);
            } else {
                if(!timeoutError) {
                    return callback(new Error('waitFor condition timed out (' + timeout + '): ' + func.toString()));
                } else {
                    return callback(new Error('waitFor condition timed out (' + timeout + '): ' + timeoutError));
                }
            }
        }
    };

    if(inBrowser){
        this.exec({ func: func, args: funcArgs }, _resultHandler);

        if(exec){
            this.exec({ func: exec, args: funcArgs }, function(err){
                if(err){
                    return callback(err); //todo: prevent double callback
                }
            });
        }
    } else {
        //This exec needs to occur "out-of-process" or it'll block waiting on the condition when asyncblock is in use
        process.nextTick(function(){
            (asyncblock || function(fn){ fn(); })(function(){
                if(exec){
                    exec();
                }
            });
        });

        if(func.length === 1){
            func(_resultHandler);
        } else if(func.length === 0){
            _resultHandler(null, func());
        } else {
            throw new Error('func must take 0 arguments, or a callback');
        }
    }
};

Driver.prototype.findElement = function(args, callback){
    var self = this;
    var startTime, selector, context, multi, timeoutMS;
    if(typeof args === 'object'){
        selector = args.selector;
        startTime = args.startTime || new Date();
        context = args.context;
        multi = args.multi;
        timeoutMS = args.timeoutMS || config.timeoutMS;
    } else {
        selector = args;
        startTime = new Date();
        multi = false;
        timeoutMS = config.timeoutMS;
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
            if(new Date() - startTime < timeoutMS){
                setTimeout(function(){
                   self.findElement({ selector: selector, context: context, startTime: startTime, multi: multi, timeoutMS: timeoutMS }, callback);
                }, config.retryMS);
            } else {
                if(element && element.length > 1){
                    return callback(new Error('Element "' + selector + '" found, but there were too many instances (' + element.length + ')'));
                } else {
                    return callback(new Error('Element "' + selector + '" not found (timeout: ' + timeoutMS + ')'));
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
    var selector, multi;

    if(typeof args === 'object'){
        selector = args.selector;
        multi = args.multi;
    } else {
        args = { selector: args };
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

    this.findElements(args, function(err, element){
        if(err){
            return callback(err);
        }

        _isVisible(element, selector, new Date(), function(err, visibles){
            if(err){
                return callback(err);
            }

            if(!multi && visibles.length > 1){
                return callback(new Error('Element "' + selector + '" found, but there were too many visible instances (' + visibles.length + ')'));
            }

            return callback(null, visibles);
        });
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

Driver.prototype.$ = function(args, callback){
    return this.exec({
        func: function(arg){
            return $(arg);
        },

        args: args
    }, callback);
};

module.exports = Driver;