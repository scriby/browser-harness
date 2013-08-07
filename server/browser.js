var child_process = require('child_process');
var fs = require('fs');

//Use asyncblock to manage flow control if it's available
var asyncblock = process.__asyncblock_included__;

var Browser = function(config){
    if(config == null || config.type == null){
        throw new Error('config.type is required');
    }

    this.config = config;
};

var _createFirefoxProfile = function(ffLocation, callback){
    var profileLocation = '/tmp/ffprofile/browser-harness';
    child_process.exec(ffLocation + ' -CreateProfile "harness ' + profileLocation + '"', function(err, stdout, stderr){
        if(err){
            return callback(err);
        }

        //Disable the default browser check by updating the prefs.js config file for the profile
        var prefsLocation = profileLocation + '/prefs.js';
        fs.readFile(prefsLocation, 'utf8', function(err, contents){
            if(err){
                return callback(err);
            }

            if(contents.indexOf('browser.shell.checkDefaultBrowser') < 0){
                fs.appendFile(prefsLocation, 'user_pref("browser.shell.checkDefaultBrowser", false);', 'utf8', function(err){
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

var _defaultConfig = {
    darwin: {
        chrome: {
            location: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: [ '*URL*', '--user-data-dir=/tmp/*RANDOM*', '-incognito', '--disable-prompt-on-repost', '--no-default-browser-check', '--no-first-run', '--disable-background-networking', '--disable-sync', '--disable-translate', '--disable-web-resources', '--safebrowsing-disable-auto-update', '--safebrowsing-disable-download-protection', '--disable-client-side-phishing-detection', '--disable-component-update', '--disable-default-apps', '--use-mock-keychain', '--ignore-certificate-errors']
        },

        firefox: {
            location: "/Applications/Firefox.app/Contents/MacOS/firefox",
            args: [ '-private', '-no-remote', '-silent', '-P', 'harness', '*URL*' ]
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
            location: 'chromium-browser',
            args: [ '*URL*', '--user-data-dir=/tmp/*RANDOM*', '-incognito', '--disable-prompt-on-repost', '--no-default-browser-check', '--no-first-run', '--disable-background-networking', '--disable-sync', '--disable-translate', '--disable-web-resources', '--safebrowsing-disable-auto-update', '--safebrowsing-disable-download-protection', '--disable-client-side-phishing-detection', '--disable-component-update', '--disable-default-apps', '--use-mock-keychain', '--ignore-certificate-errors']
        },

        firefox: {
            location: "firefox",
            args: [ '-private', '-no-remote', '-silent', '-P', 'harness', '*URL*' ]
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

    this.proc = child_process.spawn(location, browserArgs);

    this.proc.stdout.on('data', function (data) {
        console.log('browser: ' + data);
    });

    this.proc.stderr.on('data', function (data) {
        console.error('browser: ' + data);
    });
};

Browser.prototype.open = function(harnessUrl, serverUrl){
    var self = this;

    if(harnessUrl == null){
        throw new Error('harnessUrl is required');
    }

    var defaultConfig = _defaultConfig[process.platform][this.config.type];
    var location = this.config.location || defaultConfig.location;
    var args = this.config.args || defaultConfig.args;

    if(serverUrl){
        if(serverUrl.indexOf('://')){
            serverUrl = 'http://' + serverUrl;
        }

        harnessUrl += '?host=' + encodeURIComponent(serverUrl);
    }

    if(this.config.type === 'firefox'){
        _createFirefoxProfile(location, function(err, profile){
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