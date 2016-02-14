var pg = require('pg');
var express = require('express');
var util = require('util');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var geoip = require('geoip-lite');
var uuid = require('node-uuid');
var webshot = require('webshot');
webshot('google.com', 'public/google.png', {renderDelay: 1000}, function(err) {
  // screenshot now saved to google.png
});

webshot('http://www.bakeamage.com/slither', 'public/slither.png', {renderDelay: 1000}, function(err) {
  // screenshot now saved to google.png
});
var screenshot = require('node-webkit-screenshot');

var aws = require('aws-sdk');

var loadAsset = function(file, cb) {
  fs.readFile(__dirname + file, 'utf8', function(err, response) {
    if (err) {
      cb('');
    } else {
      cb(response);
    }
  });
};

var AWS_ACCESS_KEY;
var AWS_SECRET_KEY;
var S3_BUCKET;
// loadAsset('/awsconfig.txt', function(data) {
//   console.log(data);
//   if (data) {
//     var parsed = JSON.parse(data);
//     AWS_ACCESS_KEY = parsed.AWS_ACCESS_KEY;
//     AWS_SECRET_KEY = parsed.AWS_SECRET_KEY;
//     S3_BUCKET = parsed.S3_BUCKET;
//   }
// });

AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
S3_BUCKET = process.env.S3_BUCKET_NAME;
console.log(AWS_ACCESS_KEY,AWS_SECRET_KEY,S3_BUCKET);

var port = process.env.PORT || 5000; // Use the port that Heroku
server.listen(port);

console.log('listening for http and socket requests on port ' + port);

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.set('case sensitive routing', false);
//
// var mageModel = {
//   'name': {
//     renderAs: 'TextInput',
//     restrictions: {
//       min: 3,
//       max: 15
//     }
//   },
//   'numPages': {
//     renderAs: 'SelectBox',
//     restrictions: {
//       mustBe: [2, 3, 4, 5];
//     }
//   },
//   'pageName': 'TextInput'
// }
// var mageModel = [
//   {
//     name: 'name',
//     renderAs: 'TextInput',
//     restrictions: {
//       min: 3,
//       max: 15
//     }
//   },
//   {
//     name: 'numPages',
//     renderAs: 'SelectBox',
//     restrictions: {
//       mustBe: [2, 3, 4, 5];
//     }
//   },
//   {
//     name: 'pageName',
//   }
// ]

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


var layoutHTML;
function getLayoutHTML() {
  loadAsset('/public/common/layout.html', function(page) {
    layoutHTML = page;
  });
}
getLayoutHTML();

var getPageFromUrl = function(mage, pageReq) {
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
    var resHTML = layoutHTML.replace('{john-bindMage}', JSON.stringify(mage)).replace('{john-bindContent}', page.content).replace('{john-bindTitle}', mage.name + ' | ' + page.name).replace('{john-bindHeader}', mage.name);
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

var generateRoutesForMage = function(url, mage) {
  var pages = mage.pages;
  for (var i = 0; i < pages.length; i++) {
    console.log('new route: ' + '/' + url + '/' + pages[i].name);
    app.get('/' + url + '/' + pages[i].name, function(req, res, next) {
      var reqPage = req.url.split('/').pop();
      // console.log('reqpage' + reqPage)
      getPageAndSendResponse(mage, reqPage, res);
    });
    app.get('/' + url + '/', function(req, res, next) {
      getPageAndSendResponse(mage, mage.pages[0].name, res);
    });
  }
}
generateRoutesForMage(sampleMage.url, sampleMage);
generateRoutesForMage('Slither',
  {
    url: 'Slither',
     headerColor: 'rgb(185, 44, 185)',
     backgroundImage: 'https://johns-norcal.s3.amazonaws.com/image.jpeg',
     name: 'Slither Whips',
     pages:
      [ { name: 'Party!',
          content: '<br><br><br><br>Party in San Francisco tonight! February 13 be there!!!' },
        { name: 'Yep Yep',
          content: '<br><br><br><br><br><p>Wolves Dance A Lot</p>I Dance More' }
      ] });

app.use(express.static(__dirname + '/public'));
// app.use(function(req, res, next) {
//   console.log('404: ' + req.url);
//   // getPageAndSendResponse('404', res);
//   res.send('You\'re lost');
// });

io.on('connection', function(socket) {

  var geo, loc;

  var clientIp = socket.handshake.headers['x-forwarded-for'];

  if (clientIp) {
    clientIp = (clientIp.indexOf(',') > -1) ? clientIp.split(',')[0] : clientIp;
    geo = geoip.lookup(clientIp);
    loc = (geo) ? geo.city + ', ' + geo.region + ' (' + geo.country + ')' : 'n/a';
  }

  console.log('connected: ' + clientIp + ' from ' + loc);

  socket.on('createMage', function(data) {
    console.log('generating for ' + data.mage.url);
    var url = data.mage.url;
    delete data.mage.url;
    dbFunctions.checkUrlTaken(url, function(response) {
      if (response) {
        dbFunctions.createNewMage(url, data.mage, clientIp, loc, function(handshake) {
          generateRoutesForMage(url, data.mage);
          console.log();
          console.log(data.mage);
          console.log();

          console.log('webshotting... ' + 'http://' + curHost + '/' + url);

          getScreenshotAndUpload(url, function(screenshotUrl) {
            socket.emit('createResponse', {response: true, handshake: handshake, url: url, screenshotUrl: screenshotUrl});
          });

        });
      } else {
        socket.emit('createResponse', {response: false});
      }
    });

  })

  socket.on('checkURL', function(data) {
    console.log('checking ' + data.url);
    dbFunctions.checkUrlTaken(data.url, function(response) {
      setTimeout(function() {
        socket.emit('urlResponse', {
          response: response,
          url: data.url
        });
      }, 300);
    });
  });
});

var curHost;
app.get('/sign_s3', function(req, res){
  curHost = req.get('host');
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.file_name,
        Expires: 60,
        ContentType: req.query.file_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});

// CREATE TABLE mages (mageId serial primary key, url VARCHAR(30) not null, location VARCHAR(30), createdAt VARCHAR(30) not null, mageData jsonb, handshake VARCHAR(50))


var dbFunctions = {
  createNewMage: function(url, mage, ip, loc, cb) {

    var createdAt = getCurrentTimestamp();
    var handshake = uuid.v1();
    pg.connect(process.env.DATABASE_URL + "?ssl=true", function(err, client, done) {
      var queryText = 'INSERT INTO mages (url, location, createdAt, mageData, handshake, ipaddr) VALUES($1, $2, $3, $4, $5, $6)';
      client.query(queryText, [url, loc, createdAt, JSON.stringify(mage), handshake, ip], function(err, result) {

        console.log(result);
        done();
        if (err) console.log(err);
        cb(handshake);

      });
    });
  },
  loadAllMagesAndCreateRoutes: function() {
    pg.connect(process.env.DATABASE_URL + "?ssl=true", function(err, client, done) {
      client.query('SELECT * FROM mages', function(err, result) {
        done();
        result.rows.forEach(function(row) {
          generateRoutesForMage(row.url, row.magedata);
        });
      });
    });
  },
  checkUrlTaken: function(url, cb) {
    console.log('checking ' + url);
    pg.connect(process.env.DATABASE_URL + "?ssl=true", function(err, client, done) {
      client.query('SELECT * FROM mages WHERE url = \'' + url + '\'', function(err, result) {
        done();
        cb(!result.rows.length);
      });
    });
  }
}


dbFunctions.loadAllMagesAndCreateRoutes();





function getCurrentTimestamp() {
    var d = new Date();
    var date = new Date();
    date.setHours(d.getHours() - 8);

    var hour = date.getHours();
    var ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return month + "/" + day + "/" + year + ' ' + hour + ':' + min + ampm;

}


function getScreenshotAndUpload(url, cb) {
  console.log('starting the ss for ' + url);
  screenshot({
    url : 'http://' + curHost + '/' + url,
    width : 1024,
    height : 768
  })
  .then(function(buffer){
    console.log('got the buffer');
    var s3 = new aws.S3({params: { Bucket: S3_BUCKET, Key: 'screenshots/' + url + '.png' }});
    s3.upload({Body: buffer, ACL: "public-read", ContentType: 'image/png'}, function() {
      console.log("Successfully uploaded data to myBucket/myKey");
      cb('https://johns-norcal.s3.amazonaws.com/screenshots/' + url + '.png');
    });

    screenshot.close();

  });
}
