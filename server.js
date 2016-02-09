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

var routes = [
  {
    paths: ['/', '/home', '/index'],
    mapTo: 'home'
  },
  {
    paths: ['/about'],
    mapTo: 'about'
  },
  {
    paths: ['/contact'],
    mapTo: 'contact'
  }
];

var loadAsset = function(file, cb) {
  fs.readFile(__dirname + file, 'utf8', function(err, response) {
    if (err) {
      cb('');
    } else {
      cb(response);
    }
  });
};

var layoutHTML;
function getLayoutHTML() {
  loadAsset('/public/common/layout.html', function(page) {
    layoutHTML = page;
  });
}
getLayoutHTML();

var getMapToFromPath = function(path) {
  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    if (route.paths.indexOf(path) !== -1) {
      return routes[i].mapTo;
    }
  }
  return null;
};

var getPage = function(page, cb) {
  loadAsset('/public/' + page + '/' + page + '.js', function(js) {
    loadAsset('/public/' + page + '/' + page + '.css', function(css) {
      loadAsset('/public/' + page + '/' + page + '.html', function(html) {
        cb({
          title: page,
          js: js,
          css: css,
          html: html
        });
      });
    });
  });
};

var getPageAndSendResponse = function(page, res) {
  getPage(page, function(data) {
    var resHTML = layoutHTML.replace('{john-bindJS}', data.js).replace('{john-bindHTML}', data.html);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(resHTML);
    res.end();
  });
};

routes.forEach(function(route) {
  app.get(route.paths, function(req, res, next) {
    var mapTo = getMapToFromPath(req.url);
    getPageAndSendResponse(mapTo, res);
  });
});

app.use(express.static(__dirname + '/public'));
app.use('*', function(req, res, next) {
  console.log('404: ' + req.url);
  getPageAndSendResponse('404', res);
});

io.on('connection', function(socket) {
  socket.on('getPage', function(pageRequested) {
    getPage(pageRequested.page, function(pageData) {
      socket.emit('pageData', pageData);
    });
  });
});
