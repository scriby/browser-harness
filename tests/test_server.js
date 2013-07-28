var express = require('express');
var fs = require('fs');

var app = express();
var server = require('http').createServer(app);

app.get('/harness.html', function(req, res){
    res.send(fs.readFileSync(__dirname + '/../client/harness.html', 'utf8'));
});

app.use(express.static(__dirname + '/web'));

server.listen(4501);