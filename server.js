var fs = require('fs');
var express = require('express');

var app = express();
var server = require('http').createServer(app);
var Driver = require('./driver.js');

var nowjs = require("now");
var everyone = nowjs.initialize(server);

var tests = [];

app.use(express.static(__dirname + '/client'));
/*app.get('/harness/client.js', function(req, res, next){
    fs.readFile(__dirname + '/client.js', 'utf8', function(err, contents){
        if(err) {
            return next(err);
        }

        res.send(contents);
    });
});*/

exports.init = function(){
    server.listen(4500);
};

exports.registerTest = function(test){
    tests.push(test);
};

everyone.now.setup = function(){
    var self = this;

    tests.forEach(function(test){
        test(new Driver(self.now));
    });
};

