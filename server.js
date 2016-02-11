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

app.set('case sensitive routing', false);

var sampleMage = {
  url: 'donkeybrain',
  name: 'Cal\'s Mage',
  pages: [
    {
      name: 'Home',
      content: '<h1>Welcome to John\'s Music.</h1>'
    },
    {
      name: 'About',
      content: '<p>John\'s Music was created by John Murphy to allow for users to easily upload and share their audio.</p><p>When all of us here at John\'s Music began we set these as our goals...</p><ul><li>provide an easy, no-frills interface</li><li>dependable streaming platform</li><li>customizable artist pages</li></ul>'
    },
    {
      name: 'Contact',
      content: 'feel free to contact John\'s Music at johnsmusic@gmail.com'
    }
  ]
};


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

var getPageFromUrl = function(mage, pageReq) {
  console.log(mage);
  console.log();
  console.log(pageReq);
  var pages = mage.pages;
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    if (page.name.toUpperCase() === pageReq.toUpperCase()) {
      return page;
    }
  }
  return null;
}

var getPageAndSendResponse = function(mage, pageReq, res) {
  var page = getPageFromUrl(mage, pageReq);
  if (page !== null) {
    var resHTML = layoutHTML.replace('{john-bindMage}', JSON.stringify(mage)).replace('{john-bindContent}', page.content).replace('{john-bindContent}', page.content).replace('{john-bindTitle}', mage.name + ' | ' + page.name);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(resHTML);
    res.end();
  } else {
    res.send('i dont understand');
  }

};

var getPageFromPath = function(mage, path) {
  var pages = mage.pages;
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    if (page.paths.indexOf(path) !== -1) {
      return page.mapTo;
    }
  }
  return null;
}

// routes.forEach(function(route) {
//   app.get(route.paths, function(req, res, next) {
//     var reqPage = req.url;
//     getPageAndSendResponse(sampleMage, reqPage, res);
//   });
// });

var generateRoutesForMage = function(username, mage) {
  var pages = mage.pages;
  for (var i = 0; i < pages.length; i++) {
    app.get('/' + mage.url + '/' + pages[i].name, function(req, res, next) {
      var reqPage = req.url.split('/').pop();
      console.log('reqpage' + reqPage)
      getPageAndSendResponse(mage, reqPage, res);
    });
    app.get('/' + mage.url + '/', function(req, res, next) {
      getPageAndSendResponse(mage, mage.pages[0].name, res);
    });
  }
}
generateRoutesForMage(sampleMage.username, sampleMage);

app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  console.log('404: ' + req.url);
  // getPageAndSendResponse('404', res);
  res.send('You\'re lost');
});

io.on('connection', function(socket) {
});
