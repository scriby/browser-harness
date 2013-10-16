var fs = require('fs');
var events = require('events');
var express = require('express');

var app = express();
var server = require('http').createServer(app);
var Driver = require('./driver.js');

var nowjs = require("now");
var everyone = nowjs.initialize(server, { socketio: { transports: ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'] } });

var tests = [];

app.use(express.static(__dirname + '/../client'));

exports.events = new events.EventEmitter();
exports.Browser = require('./browser.js');
exports.config = require('./config.js');

exports.listen = function(port, callback){
    server.listen(port || 4500, callback);
};

var _jqCache = fs.readFileSync(__dirname + '/../client/vendor/jquery.js', 'utf8');
everyone.now.getJqueryScriptText = function(callback){
    return callback(null, _jqCache);
};

everyone.now.setup = function(){
    var driver = new Driver(this.now);

    this.now.sendConsoleLog = function(text){
        driver.events.emit('console.log', text);
    };

    this.now.sendConsoleWarn = function(text){
        driver.events.emit('console.warn', text);
    };

    this.now.sendConsoleError = function(text){
        driver.events.emit('console.error', text);
    };

    this.now.sendError = function(info){
        //info: { message, jsFinle, line, url }
        driver.events.emit('window.onerror', info);
    };

    exports.events.emit('ready', driver);
};