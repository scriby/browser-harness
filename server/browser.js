var child_process = require('child_process');

var Browser = function(config){
    if(config == null || config.type == null){
        throw new Error('config.type is required');
    }

    this.config = config;
};

var _defaultConfig = {
    darwin: {
        chrome: {
            location: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            args: [ '*URL*', '--user-data-dir=/tmp', '-incognito']
        },

        firefox: {
            location: "/Applications/Firefox.app/Contents/MacOS/firefox",
            args: [ '*URL*', '-P harness' ]
        },

        safari: {
            location: 'open',
            args: [ '-a', 'Safari', '*URL*' ]
        },

        phantomjs: {
            location: 'phantomjs',
            args: [ __dirname + '/phantom-bootstrap.js', '*URL*' ]
        }
    },

    linux: {
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

Browser.prototype.open = function(harnessUrl, serverUrl){
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

    var browserArgs = args.map(function(arg){
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

Browser.prototype.close = function(){
    if(this.proc){
        this.proc.kill();
    }

    if(this.config.type === 'safari' && process.platform === 'darwin'){
        //Closing Safari is "special"
        child_process.exec('osascript -e \'tell application "safari" to quit\'', function(err){
            if(err){
                throw err;
            }
        });
    }
};

module.exports = Browser;