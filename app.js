const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const msSqlConnecter = require("./msSqlConnector");

const app = express();

const Tedious = require('tedious');

let config = require('./credentials');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());
app.use('/public', express.static(__dirname + '/public'));


app.post('/background', (req, res, next) => {
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.email);
    console.log(req.body.status);



    let con = new msSqlConnecter.msSqlConnecter(config);
    // Attempt to connect and execute queries if connection goes through
    con.connect().then(function () {
        new con.Request("insert into AthenaHacks values(@username,@password,@email,@status)")
            .addParam("username", Tedious.TYPES.VarChar, req.body.username)
            .addParam("password", Tedious.TYPES.VarChar, req.body.password)
            .addParam("email", Tedious.TYPES.VarChar, req.body.email)
            .addParam("status", Tedious.TYPES.VarChar, req.body.status)
            .onComplate(function (count) {
                console.log(count);
            })
            .onError(function (err) {
                console.log(err);
            })
            .Run();
    }).catch(function (ex) {
        console.log(ex);
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
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

app.listen(8000, () => {
  console.log('8000');
});

module.exports = app;
