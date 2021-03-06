var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SpotifyWebApi = require('spotify-web-api-node');
var forEach = require('async-foreach').forEach;
var crypto = require('crypto');
var i18n = require('./models/i18n');


var db = require('./models/db');
var User = require('./models/User')
var index = require('./routes/index');
var spotifylogin = require('./routes/spotifylogin');
var spotifycallback = require('./routes/spotifycallback');
var lastfmlogin = require('./routes/lastfmlogin');
var lastfmcallback = require('./routes/lastfmcallback');
var adduser = require('./routes/adduser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(i18n);
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({secret:'somesecrettokenhere'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.use('/', index);
app.use('/spotifylogin', spotifylogin);
app.use('/spotifycallback', spotifycallback);
app.use('/lastfmlogin', lastfmlogin);
app.use('/lastfmcallback', lastfmcallback);
app.use('/adduser', adduser);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;