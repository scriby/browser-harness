var child_process = require('child_process');
var fs = require('fs');

//Use asyncblock to manage flow control if it's available
var asyncblock = process.__asyncblock_included__;
var utility = require('./utility');

var Browser = function(config){
    if(config == null || config.type == null){
        throw new Error('config.type is required');
    }

    this.config = config;
};

var _createFirefoxProfile = function(ffLocation, callback){
    var profileLocation = '/tmp/ffprofile/browser-harness';
    child_process.exec(ffLocation + ' -CreateProfile "harness ' + profileLocation + '"', function(err/*, stdout, stderr*/){
        if(err){
            return callback(err);
        }

        //Disable the default browser check by updating the prefs.js config file for the profile
        var prefsLocation = profileLocation + '/prefs.js';
        fs.readFile(prefsLocation, 'utf8', function(err, contents){
            if(err){
                return callback(err);
            }

            if( contents.indexOf('browser.shell.checkDefaultBrowser') < 0 ||
                contents.indexOf('toolkit.startup.max_resumed_crashes') < 0 ||
                contents.indexOf('dom.disable_open_during_load') < 0
            ){
                var configEntries = [
                    'user_pref("browser.shell.checkDefaultBrowser", false);',
                    'user_pref("toolkit.startup.max_resumed_crashes", -1);' +
                    'user_pref("dom.disable_open_during_load", false);'
                ].join('\n');

                fs.appendFile(prefsLocation, configEntries, 'utf8', function(err){
                    if(err){
                        return callback(err);
                    }

                    callback();
                });
            } else {
                callback();
            }
        });
    });
};

var _chromeArgs = [ '*URL*', '--user-data-dir=/tmp/browser-harness/chrome-profiles/*RANDOM*', '-incognito', '--disable-prompt-on-repost', '--no-default-browser-check', '--no-first-run', '--disable-background-networking', '--disable-sync', '--disable-translate', '--disable-web-resources', '--safebrowsing-disable-auto-update', '--safebrowsing-disable-download-protection', '--disable-client-side-phishing-detection', '--disable-component-update', '--disable-default-apps', '--use-mock-keychain', '--ignore-certificate-errors', '--disable-popup-blocking', '--disable-webgl'];
var _firefoxArgs = [ '-private', '-no-remote', '-silent', '-P', 'harness', '*URL*' ];

var _defaultConfig = {
    darwin: {
        chrome: {
            location: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: _chromeArgs
        },

        firefox: {
            location: "/Applications/Firefox.app/Contents/MacOS/firefox",
            args: _firefoxArgs
        },

        safari: {
            location: 'open',
            args: [ '-a', 'Safari', '-n', '*URL*' ]
        },

        phantomjs: {
            location: 'phantomjs',
            args: [ __dirname + '/phantom-bootstrap.js', '*URL*' ]
        }
    },

    linux: {
        chrome: {
            location: 'google-chrome',
            args: _chromeArgs
        },

        chromium: {
            location: 'chromium-browser',
            args: _chromeArgs
        },

        firefox: {
            location: "firefox",
            args: _firefoxArgs
        },

        phantomjs: {
            location: 'phantomjs',
            args: [ __dirname + '/phantom-bootstrap.js', '*URL*' ]
        }
    },

    win32: {
        phantomjs: {
            location: 'phantomjs',
            args: [ __dirname + '/phantom-bootstrap.js', '*URL*' ]
        }
    }
};

Browser.prototype._open = function(location, harnessUrl, args){
    var browserArgs = args.map(function(arg){
        arg = arg.replace(/\*RANDOM\*/g, Math.floor(Math.random() * 999999999999999));

        if(arg === '*URL*'){
            return harnessUrl;
        } else {
            return arg;
        }
    });

    this.proc = child_process.spawn(location, browserArgs, { env: process.env });

    this.proc.stdout.on('data', function (data) {
        console.log('browser: ' + data);
    });

    this.proc.stderr.on('data', function (data) {
        console.error('browser: ' + data);
    });
};

Browser.prototype.open = function(harnessUrl, serverUrl){
    var self = this;

    harnessUrl = utility.constructHarnessUrl(harnessUrl, serverUrl);

    var defaultConfig = _defaultConfig[process.platform][this.config.type];
    var location = this.config.location || defaultConfig.location;
    var args = this.config.args || defaultConfig.args;

    if(this.config.type === 'firefox'){
        _createFirefoxProfile(location, function(err){
            if(err){
                console.log(err);
            } else {
                self._open(location, harnessUrl, args);
            }
        });
    } else {
        self._open(location, harnessUrl, args);
    }
};

Browser.prototype.close = function(callback){
    //Use asyncblock fibers if it is available
    if(asyncblock && callback == null){
        var flow = asyncblock.getCurrentFlow();

        if(flow){
            return flow.sync( this.close(flow.add()) );
        }
    }

    if(this.proc){
        this.proc.on('exit', function(){
            callback();
        });

        this.proc.kill();
    }

    if(this.config.type === 'safari' && process.platform === 'darwin'){
        //Closing Safari is "special"
        child_process.exec('osascript -e \'tell application "safari" to quit\'', function(err){
            if(err){
                throw err;
            }

            callback();
        });
    }
};

module.exports = Browser;