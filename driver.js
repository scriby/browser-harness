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

Driver.prototype._convertElementProxy = function(obj){
    return new ElementProxy(obj, this);
};

Driver.prototype._convertArguments = function(args){
    for(var i = 0; i < args.length; i++){
        var item = args[i];

        if(item && item.context && item.length){
            //A jQuery object was returned - convert it to just the raw object
            item = item[0];
        }

        if(item && item.isElementProxy){
            args[i] = this._convertElementProxy(item);
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
            setTimeout(function(){
                self.waitFor(args, callback);
            }, 100);
        }
    });
};

Driver.prototype.findElement = function(args, callback){
    var self = this;
    var startTime;
    var selector;
    if(typeof args === 'object'){
        selector = args.selector;
        startTime = args.startTime;
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
        func: function(selector){
            return $(selector)[0];
        },

        args: selector
    }, function(err, element){
        if(err){
            return callback(err);
        }

        if(element) {
           callback(null, element);
        } else {
            if(new Date() - startTime < config.timeoutMS){
                setTimeout(function(){
                   self.findElement({ selector: selector, startTime: startTime }, callback);
                }, config.retryMS);
            } else {
                return callback(new Error('Element "' + selector + '" not found'));
            }
        }
    });
};

var _isVisibleAndEnabled = function(element, selector, startTime, callback){
    //Select not-disabled elements instead of enabled elements because only certain types of elements can be enabled
    //For instance, anchor tags cannot be enabled - so they will always fail an enabled check
    element.is(':visible:not(:disabled)', function(err, isVisible){
        if(err) {
            return callback(err);
        }

        if(isVisible){
            callback(null, element);
        } else {
            if(new Date() - startTime < config.timeoutMS){
                setTimeout(function(){
                   _isVisibleAndEnabled(element, selector, startTime, callback);
                }, config.retryMS);
            } else {
                return callback(new Error('Element "' + selector + '" was found, but is not visible and enabled.'));
            }
        }
    });
};

Driver.prototype.findReady = function(args, callback){
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
            return flow.sync( this.findReady(args, flow.add()) );
        }
    }

    this.findElement(args, function(err, element){
        if(err){
            return callback(err);
        }

        _isVisibleAndEnabled(element, selector, new Date(), callback);
    });
};

module.exports = Driver;