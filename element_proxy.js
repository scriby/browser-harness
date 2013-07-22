var ElementProxy = function(element, driver){
    this.element = element;
    this.driver = driver;
};

ElementProxy.prototype._exec = function(args, callback){
    this.driver.exec({
        func: function(args){
            var result;
            var element = $(args.element);
            if(args.funcArgs){
                if(Array.isArray(args.funcArgs)){
                    result = element[args.func].apply(element, args.funcArgs);
                } else {
                    result = element[args.func](args.funcArgs);
                }
            } else {
                result = element[args.func]();
            }

            if(args.captureReturn){
                return result;
            }
        },

        args: {
            func: args.func,
            funcArgs: args.funcArgs,
            captureReturn: args.captureReturn,
            element: this.element
        }
    }, callback);
};

ElementProxy.prototype.click = function(callback){
    this._exec({ func: 'click' }, callback);
};

ElementProxy.prototype.val = function(value, callback){
    this._exec({ func: 'val', funcArgs: value, captureReturn: value == null }, callback);
};

ElementProxy.prototype.attr = function(name, value, callback){
    this._exec({ func: 'attr', funcArgs: [ name, value ], captureReturn: value == null }, callback);
};

module.exports = ElementProxy;