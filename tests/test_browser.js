var harness = require('browser-harness');

var _driver, _browser;

harness.events.on('ready', function(driver){
    _driver = driver;

    driver.events.on('console.log', function(text){
        console.log('console.log: ' + text);
    });

    driver.events.on('console.warn', function(text){
        console.log('console.warn: ' + text);
    });

    driver.events.on('console.error', function(text){
        console.log('console.error: ' + text);
    });

    driver.events.on('window.onerror', function(info){
        console.log('window.onerror: ' + info);
    });
});

exports.getDriver = function(callback){
    if(_driver){
        return callback(null, _driver);
    } else {
        harness.events.once('ready', function(driver){
            return callback(null, driver);
        });
    }
};

exports.open = function(){
    _browser = new harness.Browser({ type: process.env['BROWSER'] || 'phantomjs' });
    _browser.open('http://localhost:4501/harness.html');
};

exports.reset = function(){
    _driver = null;
};

exports.close = function(){
    _browser.close();
};