var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
const http = require('http')
var api = require('./routers/api.js'),
	map = require('./routers/map.js'),
	user = require('./routers/user.js'),
	cp = require('./routers/cp.js'),
	grp = require('./routers/grp.js'),
	roles = require('./routers/roles.js'),
	func = require('./routers/func.js'),
	sys = require('./routers/sys.js'),
	control = require('./routers/control.js'),
	device = require('./routers/device.js');
	log = require('./routers/log.js'),
	profile = require('./routers/profile.js'),
	zone = require('./routers/zone.js');
var config = require('./config');
var async   = require('async'),
	request = require('request');
// Authentication module.
var auth = require('http-auth');
var morgan = require('morgan');
var cors = require('cors');
var mqttSubClient = require('./modules/mqttSubClient.js');
var basic = auth.basic({
	realm: "Node JS API",
    file: "./keys.htpasswd" // gevorg:gpass, Sarah:testpass ...
});
// Jason add for line-bot notify on 2018.04.24 -- start 
var path = require('path');
var JsonFileTools =  require('./modules/jsonFileTools.js');
var userPath = './public/data/friend.json';
app.set('port', process.env.PORT || config.port)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev')); // log every request to the console
app.use(cors());

if(config.auth == true) {
	app.use(auth.connect(basic));
}

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  next();
});

router.get('/', function(req, res) {
	res.json({ message: 'MQTT Broker and API!' });
});

app.use('/user'  + config.baseurl, user);//Login,logout,User
app.use('/api' + config.baseurl, api);
app.use('/admin' + config.baseurl, cp);//Company
app.use('/admin' + config.baseurl, grp);//Group	
app.use('/admin' + config.baseurl, log);
app.use('/admin' + config.baseurl, roles);//Role : user limit
app.use('/admin' + config.baseurl, func);//function : WEB function enable or not
app.use('/sys' + config.baseurl, sys);
app.use('/control' + config.baseurl, control);
app.use('/device' + config.baseurl, map);//Device type map
app.use('/device' + config.baseurl, device);
app.use('/device' + config.baseurl, profile);
app.use('/device' + config.baseurl, zone);

api = require('./routers/api.js'),

app.use(function(req, res, next) {
	res.status(404);
	res.send({
		"success" : 0,
		"message" : 'Invalid URL'
	});
});

var server = app.listen(config.port, function () {
	console.log(server.address());
	var host = server.address().address;
	var port = server.address().port;

	console.log('Server listening at http://localhost:%s', port);
	console.log('api url : http://localhost:8000/api/:table');
});

/*const server = http.createServer(app).listen(app.get('port'), '0.0.0.0', () => {
    console.log("Server started at " + app.get('port') )
  })*/
//const server = http.createServer(app);

var io = require('socket.io')(server, {
	allowEIO3:true
  })

io.sockets.on('connection', function (socket) {
    // mySocket = socket;
    // socket.emit() ：向建立该连接的客户端广播
    // socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
    // io.sockets.emit() ：向所有客户端广播，等同于上面两个的和
	socket.emit('news', { hello: 'world' });

	socket.on('test', function (m) {
		console.log('server receive test :'+m );
	});

	socket.on('mqtt_sub', function (m) {
		console.log('server receive replay :'+m );
	});

	socket.on('MQTT_REPORT_DATA', function (m) {
		console.log('server MQTT_REPORT_DATA :'+ JSON.stringify(m)  );
		io.sockets.emit('mqtt_report_data', m);
	});

	socket.on('disconnect', function () {
		
	});
  
});
