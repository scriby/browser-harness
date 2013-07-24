var config = require('./config.js');

var asyncblock;
try{
    //Use asyncblock to manage flow control if it's available
    asyncblock = require('asyncblock');
} catch(e){ }

var ElementProxy = require('./element_proxy.js');

var Driver = function(now){
    this.now = now;
};

Driver.prototype._convertArguments = function(args){
    for(var i = 0; i < args.length; i++){
        var item = args[i];

        if(item && item.length){
            //jQuery variables don't come across as arrays - convert it
            var array = [];
            for(var j = 0; j < item.length; j++){
                if(item[j].isElementProxy){
                    array.push(item[j]);
                }
            }

            if(array.length > 0){
                array.__proto__ = ElementProxy.prototype;
                array.driver = this;

                args[i] = array;
            }
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

        function(){
            self._convertArguments(arguments);

            callback && callback.apply(null, arguments)
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

    this.now.setUrl(url, callback);
};

Driver.prototype.waitFor = function(args, callback){
    var self = this;
    var startTime;
    var func;
    var timeout;
    if(typeof args === 'object'){
        func = args.func;
        startTime = args.startTime;
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

    this.exec(args, function(err, result){
        if(err){
            return callback(err);
        }

        if(result){
            return callback();
        } else {
            if(new Date() - startTime < timeout){
                setTimeout(function(){
                    self.waitFor({ func: func, startTime: startTime }, callback);
                }, config.retryMS);
            } else {
                return callback(new Error('waitFor condition timed out: "' + func.toString()));
            }
        }
    });
};

Driver.prototype.findElement = Driver.prototype.find = function(args, callback){
    var self = this;
    var startTime;
    var selector;
    var context;
    if(typeof args === 'object'){
        selector = args.selector;
        startTime = args.startTime;
        context = args.context;
    } else {
        selector = args;
        startTime = new Date();
    }

    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.findElement(args, flow.add()) );
        }
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

        if(element) {
           callback(null, element);
        } else {
            if(new Date() - startTime < config.timeoutMS){
                setTimeout(function(){
                   self.findElement({ selector: selector, context: context, startTime: startTime }, callback);
                }, config.retryMS);
            } else {
                return callback(new Error('Element "' + selector + '" not found'));
            }
        }
    });
};

var _isVisible = function(element, selector, startTime, callback){
    //Select not-disabled elements instead of enabled elements because only certain types of elements can be enabled
    //For instance, anchor tags cannot be enabled - so they will always fail an enabled check
    element.is(':visible', function(err, isVisible){
        if(err) {
            return callback(err);
        }

        if(isVisible){
            callback(null, element);
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
        selector = args;
    }

    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.findVisible(args, flow.add()) );
        }
    }

    this.findElement(args, function(err, element){
        if(err){
            return callback(err);
        }

        _isVisible(element, selector, new Date(), callback);
    });
};

module.exports = Driver;