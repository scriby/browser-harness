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

Driver.prototype.findElement = function(selector, callback){
    return this.exec({
        func: function(selector){
            return $(selector)[0];
        },

        args: selector
    }, callback);
};

module.exports = Driver;