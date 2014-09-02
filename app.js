
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , upfile = require('./routes/upfile')
  , fs = require('fs')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({uploadDir:'./upfiles'}));
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upfiles')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.all('*', function (req, res, next) {
	if (req.path.indexOf('/upfiles') == 0) {
		var f = path.join(__dirname, 'upfiles', req.path.replace('/upfiles', ''));
		res.end(fs.readFileSync(f));
	}
	else {
		next();
	}
	// next();

});
app.get('/', routes.index);
app.get(/\/index\.html/, routes.index);
app.get(/\/app(?:\/\w+?)?/, routes.index);
app.get(/\/startup(?:\/\w+?)?/, routes.index);
app.post('/login', routes.login);
app.get('/login', routes.loginpage);
app.get('/selrole', routes.selrole);
app.get('/setrole', routes.setrole);
app.get('/cgi/json', routes.json);
app.post('/cgi/post', routes.post);
app.post('/upfile', upfile.upfile)
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
