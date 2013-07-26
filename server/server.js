var events = require('events');
var express = require('express');

var app = express();
var server = require('http').createServer(app);
var Driver = require('./driver.js');

var nowjs = require("now");
var everyone = nowjs.initialize(server);

var tests = [];

app.use(express.static(__dirname + '/../client'));

exports.events = new events.EventEmitter();

exports.init = function(){
    server.listen(4500);
};

everyone.now.setup = function(){
    var self = this;
    console.log('ready');
    exports.events.emit('ready', new Driver(self.now));
};

