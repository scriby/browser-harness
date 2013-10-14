(function(){
    var WindowManager = (function(){
        var WindowManager = function(){
            this.cache = {};
            this.lastPopupWindow = null;
        };

        WindowManager.prototype.patch = function(window){
            if(window.open.__harness_patched__){
                return;
            }

            var self = this;

            var oldOpen = window.open;
            window.open = function(){
                var handle = oldOpen.apply(this, arguments);

                self.lastPopupWindow = handle;
                self.serialize(handle);

                self.patch(handle);
                retryPatchConsole(handle);

                return handle;
            };

            window.open.__harness_patched__ = true;
        };

        WindowManager.prototype.getPopupByTitle = function(title){
            var self = this;
            var matches = [];

            Object.keys(this.cache).forEach(function(id){
                var win = self.cache[id];

                if(win.closed){
                    delete self.cache[id];
                    return;
                }

                if(win.document.title === title){
                    matches.push(win);
                }
            });

            return matches;
        };

        WindowManager.prototype.clearLastPopupWindow = function(){
            this.lastPopupWindow = null;
        };

        WindowManager.prototype.getLastPopupWindow = function(){
            return this.serialize(this.lastPopupWindow);
        };

        WindowManager.prototype.isWindowOpen = function(id){
            var existing = this.cache[id];

            if(!existing){
                return false;
            } else if(existing.closed){
                delete this.cache[id];
                return false;
            } else {
                return true;
            }
        };

        WindowManager.prototype.getFrame = function($element){
            return this.serialize($element[0].contentWindow);
        };

        WindowManager.prototype.serialize = function(window){
            if(window == null){
                return window;
            }

            if(window.__id__ == null){
                window.__id__ = Math.random();
                this.cache[window.__id__] = window;
            }

            return {
                isWindowProxy: true,
                id: window.__id__
            };
        };

        WindowManager.prototype.deserialize = function(windowProxy){
            if(windowProxy == null){
                return windowProxy;
            }

            return this.cache[windowProxy.id];
        };

        WindowManager.prototype.getById = function(id){
            return this.cache[id];
        };

        return new WindowManager();
    })();

    var _jQueryScriptText;
    var testFrame = document.getElementById('testFrame');

    var patchElementToJson = function(window){
        if(window.Element.prototype.toJSON == null){
            //Inject JSON serialization for DOM elements
            window.Element.prototype.toJSON = function(){
                return convertFromDomElement(this);
            };
        }

        //Accessing window.Element for another window (even same origin) throws an error in IE 8/9. Here's a workaround:
        //var x = window.Function('_harness', 'window.Element.prototype.toJSON = function(){ return _harness.convertFromDomElement(this); }');
        //x(_harness);
    };
    
    patchElementToJson(window);

    var patchConsole = function(window){
        if(window && !window.__harness_consolePatched__){
            if(!window.console){
                window.console = {};
            }

            var oldLog = window.console.log;
            var oldError = window.console.error;
            var oldWarn = window.console.warn;

            window.console.log = function(text){
                if(now.sendConsoleLog) {
                    now.sendConsoleLog(text);
                }

                if(oldLog && oldLog.call){
                    oldLog.call(window.console, text);
                }
            };

            window.console.warn = function(text){
                if(now.sendConsoleWarn){
                    now.sendConsoleWarn(text);
                }

                if(oldWarn && oldWarn.call){
                    oldWarn.call(window.console, text);
                }
            };

            window.console.error = function(text){
                if(now.sendConsoleError){
                    now.sendConsoleError(text);
                }

                if(oldError && oldError.call){
                    oldError.call(window.console, text);
                }
            };

            window.__harness_consolePatched__ = true;
        }
    };

    //Need to keep trying in case the page changes
    var retryPatchConsole = function(window){
        try{
            patchConsole(window);
        } catch(e){
            //IE 10 throws a permission error sometimes
            console && console.log(e);
        }

        if(!window.closed){
            setTimeout(function(){
                retryPatchConsole(window);
            }, 100);
        }
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
    retryPatchConsole(testFrame.contentWindow);

    patchErrorHandler(window);
    patchTestFrameErrorHandler();
    WindowManager.patch(testFrame.contentWindow);

    var patchJQueryExtensions = function($){
        if($ && $.fn && !$.fn._isVisible){
            $.fn._isVisible = function(){
                var $this = $(this);

                return !$this.is(':hidden') &&
                    $this.css('visibility') !== 'hidden' &&
                    $this.parents().filter(function(){
                        return $(this).css('visibility') === 'hidden';
                    }).length === 0;
            };

            $.fn._filterVisible = function(){
                return this.filter($.fn._isVisible);
            };
        }
    };

    $.prototype.toJSON = function(){
        return {
            isElementArray: true,
            //This map helps work around some squirly errors in old IE when returning elements from other windows
            elements: Array.prototype.slice.call(this, 0).map(function(element){ return element.toJSON(); }) //Convert to array. Need to remove extra jQuery properties as they don't always serialize well
        };
    };

    var exec = function(args, callback){
        try{
            var focusedWindow = args.focusedWindow;

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
                func = focusedWindow.Function(funcText);
            } else if(funcArgs.length === 1){
                func = focusedWindow.Function(funcArgs[0], funcText);
            } else if(funcArgs.length === 2){
                func = focusedWindow.Function(funcArgs[0], funcArgs[1], funcText);
            }

            WindowManager.patch(focusedWindow);
            patchJQueryExtensions($);
            patchJQueryExtensions(focusedWindow.$);

            if(focusedWindow.$.prototype.toJSON == null){
                focusedWindow.$.prototype.toJSON = $.prototype.toJSON;
            }

            patchElementToJson(focusedWindow);
            if(hasCallback){
                if(args.args){
                    func(convertArgument(args.args, focusedWindow), callback);
                } else {
                    func(callback);
                }
            } else {
                var result = func(convertArgument(args.args, focusedWindow));
                callback(null, result);
            }
       } catch(e){
            var toReport = '';
            var message = (e && e.message) || '';
            var stack = (e && e.stack) || '';

            if(message && stack){
                toReport = message + '\n\n' + stack;
            } else if(message){
                toReport = message;
            } else if(stack){
                toReport = stack;
            } else {
                toReport = e || 'A javascript error occurred in the browser';
            }

            callback(toReport);
        }
    };

    now.exec = function(args, callback){
        args.focusedWindow = WindowManager.deserialize(args.focusedWindow) || testFrame.contentWindow;

        if(args.focusedWindow.$ == null){
            try{
                //This is a workaround for IE8 where eval is not available in the iframe until calling execScript
                //http://stackoverflow.com/questions/2720444/why-does-this-window-object-not-have-the-eval-function
                if(!args.focusedWindow.eval && args.focusedWindow.execScript){
                    args.focusedWindow.execScript('null');
                }

                args.focusedWindow.eval(_jQueryScriptText);
            } catch(e){
                //This is a workaround for Firefox. It was having problems with evaluating the jQuery script when the
                //frame was transitioning between pages. I couldn't figure out a way to detect whether this would error
                //ahead of time
                setTimeout(function(){
                    now.exec(args, callback);
                }, 100);

                return;
            }
        }

        exec(args, callback);
    };

    now.setUrl = function(url, callback){
        testFrame.src = url;

        if (testFrame.attachEvent) {
          var handler = function(){
              testFrame.detachEvent('onload', handler);
              callback && callback();
          };

          testFrame.attachEvent('onload', handler);
        } else {
          testFrame.onload = function(){
              testFrame.onload = null;
              callback && callback();
          };
        }
    };

    now.reuseBrowser = function(harnessUrl){
        if(harnessUrl){
            location.replace(harnessUrl);
        } else {
            location.replace(location.href);
        }
    };

    now.clearLastPopupWindow = function(callback){
        WindowManager.clearLastPopupWindow();
        callback();
    };

    now.getLastPopupWindow = function(callback){
        return callback(null, WindowManager.getLastPopupWindow());
    };

    now.isWindowOpen = function(windowProxy, callback){
        return callback(null, WindowManager.isWindowOpen(windowProxy.id));
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

    var convertArgument = function(arg, focusedWindow){
        if(isElementProxy(arg)){
            return focusedWindow.$(convertFromElementProxy(arg));
        } else if(Array.isArray(arg)){
            var containsElement = false;

            //Special case arrays for faster looping
            for(var i = 0; i < arg.length; i++){
                if(isElementProxy(arg[i])){
                    arg[i] = convertFromElementProxy(arg[i]);
                    containsElement = true;
                } else {
                    arg[i] = convertArgument(arg[i], focusedWindow);
                }
            }

            if(containsElement){
                return focusedWindow.$(arg);
            } else {
                return arg;
            }
        } else if(typeof arg === 'object'){
            for(var key in arg){
                arg[key] = convertArgument(arg[key], focusedWindow);
            }

            return arg;
        } else {
            return arg;
        }
    };
})();