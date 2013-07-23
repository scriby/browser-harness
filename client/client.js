var testFrame = document.getElementById('testFrame');

now.exec = function(args, callback){
    var hasCallback = false;
    var match = /^function\s*\(([^\)]*)\)/.exec(args.func);
    var funcArgs;
    if(match[1] != null){
        funcArgs = match[1].split(',');

        if(funcArgs.length === 1 && funcArgs[0] === ''){
            funcArgs = [];
        }

        if(args.args && funcArgs.length > 1){
            hasCallback = true;
        } else if(!args.args && funcArgs.length > 0){
            hasCallback = true;
        }
    } else {
        funcArgs = [];
    }

    var funcText = args.func;
    funcText = funcText.replace(/^function.*\{/, '');
    funcText = funcText.replace(/\}$/, '');

    var func;
    if(funcArgs.length === 0){
        func = new testFrame.contentWindow.Function(funcText);
    } else if(funcArgs.length === 1){
        func = new testFrame.contentWindow.Function(funcArgs[0], funcText);
    } else if(funcArgs.length === 2){
        func = new testFrame.contentWindow.Function(funcArgs[0], funcArgs[1], funcText);
    }

    if(testFrame.contentWindow.$ == null){
        //JQuery is not loaded in test frame. Inject the harness's copy into it
        var html = testFrame.contentWindow.document.getElementsByTagName('html')[0];
        testFrame.contentWindow.$ = function(selector){ return $(selector, html); };
    }

    if(testFrame.contentWindow.Element.prototype.toJSON == null){
        //Inject JSON serialization for DOM elements
        testFrame.contentWindow.Element.prototype.toJSON = function(){
            return convertFromDomElement(this);
        };
    }

    if(hasCallback){
        if(args.args){
            func(convertArgument(args.args), convertCallback);
        } else {
            func(callback);
        }
    } else {
        var result = func(convertArgument(args.args));
        callback(null, result);
    }
};

now.setUrl = function(url, callback){
    testFrame.src = url;

    if (testFrame.attachEvent) {
      testFrame.attachEvent('onload', function(){
          callback && callback();
      });
    } else {
      testFrame.onload = function(){
          callback && callback();
      };
    }
};

now.ready(function(){
    now.setup();
});

var _elementCache = {};

var isDomElement = function(obj){
    return obj != null && obj.nodeName != null && obj.nodeType != null;
};

var isElementProxy = function(obj){
    return obj != null && obj.isElementProxy;
};

var convertFromDomElement = function(obj){
    if(obj.__id__ == null){
        obj.__id__ = Math.random();
    }

    _elementCache[obj.__id__] = obj;

    return {
        isElementProxy: true,
        id: obj.__id__
    };
};

var convertFromElementProxy = function(obj){
    return _elementCache[obj.id];
};

var convertReturnValue = function(result){
    if(isDomElement(result)){
        return convertFromDomElement(result);
    } else {
        return result;
    }
};

var convertArgument = function(arg){
    if(isElementProxy(arg)){
        return convertFromElementProxy(arg);
    } else if(typeof arg === 'object'){
        for(var key in arg){
            if(isElementProxy(arg[key])){
                arg[key] = convertFromElementProxy(arg[key]);
            }
        }

        return arg;
    } else {
        return arg;
    }
};