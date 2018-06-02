var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var main = require('./routes/main');
var joinForm = require('./routes/joinForm');
var user = require('./routes/user');
var notice = require('./routes/notice');
var list = require('./routes/list');
var delivery = require('./routes/delivery');
var admin = require('./routes/admin');
var order = require('./routes/order');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', main);
app.use('/join', joinForm);
app.use('/user', user);
app.use('/notice', notice);
app.use('/list', list);
app.use('/delivery', delivery);
app.use('/admin', admin);
app.use('/order', order);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
