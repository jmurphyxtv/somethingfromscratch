var pg = require('pg');
var express = require('express');
var util = require('util');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');

var port = process.env.PORT || 5000; // Use the port that Heroku
server.listen(port);

console.log('listening for http and socket requests on port ' + port);

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get(['/','/about','/contact'], function(req,res,next) {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'));
