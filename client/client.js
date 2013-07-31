(function(){
    var _jQueryScriptText;
    var testFrame = document.getElementById('testFrame');

    var patchElementToJson = function(window){
        if(window.Element.prototype.toJSON == null){
            //Inject JSON serialization for DOM elements
            window.Element.prototype.toJSON = function(){
                return convertFromDomElement(this);
            };
        }
    };
    patchElementToJson(window);

    var patchConsole = function(window){
        if(!window.console.patched){
            var oldLog = window.console.log;
            var oldError = window.console.error;
            var oldWarn = window.console.warn;

            window.console.log = function(text){
                if(now.sendConsoleLog) {
                    now.sendConsoleLog(text);
                }
                oldLog.call(window.console, text);
            };

            window.console.warn = function(text){
                if(now.sendConsoleWarn){
                    now.sendConsoleWarn(text);
                }

                oldWarn.call(window.console, text);
            };

            window.console.error = function(text){
                if(now.sendConsoleError){
                    now.sendConsoleError(text);
                }

                oldError.call(window.console, text);
            };

            window.__harness_consolePatched__ = true;
        }
    };

    //Need to keep trying in case the page changes
    var patchTestFrameConsole = function(){
        var testFrameWindow = testFrame.contentWindow;
        if(testFrameWindow && testFrameWindow.console && !testFrameWindow.__harness_consolePatched__) {
            patchConsole(testFrameWindow);
        }

        setTimeout(patchTestFrameConsole, 100);
    };

    var patchErrorHandler = function(window){
        var oldOnError = window.onerror;

        window.onerror = function(message, jsFile, line){
            now.sendError({
                message: message,
                jsFile: jsFile,
                line: line,
                url: window.location.href
            });

            if(oldOnError){
                return oldOnError.apply(window, arguments);
            }
        };

        window.__harness_onErrorPatched__ = true;
    };

    //Need to keep trying in case the page changes
    var patchTestFrameErrorHandler = function(){
        var testFrameWindow = testFrame.contentWindow;
        if(testFrameWindow && (!testFrameWindow.onerror || !testFrameWindow.__harness_onErrorPatched__)) {
            patchErrorHandler(testFrameWindow);
        }

        setTimeout(patchTestFrameErrorHandler, 100);
    };

    patchConsole(window);
    patchTestFrameConsole();

    patchErrorHandler(window);
    patchTestFrameErrorHandler();

    var patchJQueryExtensions = function($){
        if($ && $.fn && !$.fn._isVisible){
            $.fn._isVisible = function(){
                var $this = $(this);

                return !$this.is(':hidden') &&
                    $this.css('visibility') !== 'hidden' &&
                    $this.parents().filter(function(){
                        return $this.css('visibility') === 'hidden';
                    }).length === 0;
            };

            $.fn._filterVisible = function(){
                return this.filter($.fn._isVisible);
            };

            $.fn._isActionable = function(){
                return !this.is(":disabled") && this._isVisible();
            };
        }
    };

    $.prototype.toJSON = function(){
        return {
            isElementArray: true,
            elements: Array.prototype.slice.call(this, 0) //Convert to array. Need to remove extra jQuery properties as they don't always serialize well
        };
    };

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
            //JQuery is not loaded in test frame. Inject it
            testFrame.contentWindow.eval(_jQueryScriptText);
        }

        patchJQueryExtensions($);
        patchJQueryExtensions(testFrame.contentWindow.$);

        if(testFrame.contentWindow.$.prototype.toJSON == null){
            testFrame.contentWindow.$.prototype.toJSON = $.prototype.toJSON;
        }

        patchElementToJson(testFrame.contentWindow);
        if(hasCallback){
            if(args.args){
                func(convertArgument(args.args), callback);
            } else {
                func(callback);
            }
        } else {
            try{
                var result = func(convertArgument(args.args));

                callback(null, result);
            } catch(e){
                callback((e && e.stack) || (e && e.message) || e || 'A javascript error occurred in the browser');
            }
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
        //Fetch the contents of the jQuery script directly so we can inject it into the iframe synchronously if it doesn't have jQuery
        now.getJqueryScriptText(function(err, contents){
            if(err){
                throw err;
            }

            _jQueryScriptText = contents;

            now.setup();
        });
    });

    var _elementCache = window._elementCache = {}; //Expose window._elementCache for debugging

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
        } else if(Array.isArray(arg)){
            //Special case arrays for faster looping
            for(var i = 0; i < arg.length; i++){
                if(isElementProxy(arg[i])){
                    arg[i] = convertFromElementProxy(arg[i]);
                }
            }

            return arg;
        } else if(typeof arg === 'object'){
            for(var key in arg){
                arg[key] = convertArgument(arg[key]);
            }

            return arg;
        } else {
            return arg;
        }
    };
})();