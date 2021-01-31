
/**
	* Node.js Login Boilerplate
	* More Info : https://github.com/braitsch/node-login
	* Copyright (c) 2013-2020 Stephen Braitsch
**/

var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
//var MongoStore = require('connect-mongo')(session);

var app = express();

app.locals.pretty = true;
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/app/server/views');
app.set('view engine', 'pug');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use(express.static(__dirname+"/client"));

// build mongo database connection url //

process.env.DB_HOST = 'gody.0onor.mongodb.net'
process.env.DB_NAME = 'test';
process.env.DB_USER = 'admin'
process.env.DB_PASS = 'admin'
// prepend url with authentication credentials // 
	process.env.DB_URL = 'mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+'/test?retryWrites=true&w=majority';


app.use(session({
	secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
	proxy: true,
	resave: true,
	saveUninitialized: true,
	//store: new MongoStore({ url: process.env.DB_URL })
	})
);

require('./app/server/routes')(app);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

