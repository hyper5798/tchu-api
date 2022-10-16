var mqtt = require('mqtt');
var config = require('../config');
var util = require('./util.js');
var schedule = require('node-schedule');

const io = require('socket.io-client');
let wsUrl ='http://localhost:'+config.port;
let socket = io.connect(wsUrl, {reconnect: true});

socket.on('connect',function(){
	socket.emit('mqtt_sub','**** mqtt_sub socket cient is ready');
});
  
socket.on('disconnect',function(){
console.log('mqtt handller websocket disconnct');
if (socket.connected === false ) {
	//socket.close()
	socket.open();
}
});
  
  socket.on('news',function(m){
	socket.emit('reply','mqttSubClient receive news');  
	console.log('mqttSubClient receive news :');
	console.log(m)
  });

function scheduleCronstyle(){
    schedule.scheduleJob('30 25 11 * * *', function(){
				console.log('scheduleCronstyle:' + new Date());
				util.sendAdminLineMessage();
    }); 
}

scheduleCronstyle();

//Jason add for fix Broker need to foward message to subscriber on 2018-04-01
var options = {
	host: config.mqttHost,
	port: config.mqttPort,
	// clientId: config.client_Id,
    username: config.mqttName,
	password: config.mqttPassword,
	// encoding: 'utf8',
	protocolId: 'MQIsdp',
	protocolVersion: 3
};

var client = mqtt.connect(options);
client.on('connect', function()  {
	console.log(new Date() + ' ***** MQTT connect...' + client.clientId);
    client.subscribe(config.mytopic);
});

client.on('message', function(topic, msg) {
	console.log(new Date() + ' ****** topic:'+topic);
	console.log('message:' + msg.toString());
	util.parseMsgd(msg.toString(), function(err, message){

		if(err) {
			return;
		} else {
		  if (message) {
			socket.emit('MQTT_REPORT_DATA',message);
			console.log(util.getCurrentTime() + ' *** Publish parse and sendmessage OK');
		  }
		  return;
		}
	  });
});

client.on('disconnect', function() {
	console.log(new Date() + ' ****** mqtt disconnect' );
	if (socket.connected === false ) {
		//socket.close()
		socket.open();
	}
});