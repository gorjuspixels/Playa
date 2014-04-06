var express = require('express')
  , app = express()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, request = require('request')
	, lame = require('lame')
	, Speaker = require('speaker');


app.use("/", express.static(__dirname + '/'))

var PORT = 3000
var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"
var SOUNDCLOUD_SECRET = "8bbad1fd360dce19be13d05102d55985"

var playing = false
var clients = {}
var socketsOfClients = {}
var trackStreaming;
var speakersPipe = (new lame.Decoder()).on('format', function (format) {
			    this.pipe(new Speaker(format));
			  })

app.get('/', function(req, res){
  res.sendfile('views/index.html')
})

// create a player instance from playlist
var tracks = [
	"https://soundcloud.com/arthyum/red-hot-chili-peppers",
	"https://soundcloud.com/dualseize/suicide-doors",
	"https://soundcloud.com/sikdope/faithless-insomnia-sikdope"
]




function streamTrack(trackID) {

	if (playing) {
		speakersPipe.unpipe()
		speakersPipe = (new lame.Decoder()).on('format', function (format) {
			    this.pipe(new Speaker(format));
			  })
	}

	trackStreaming = request("http://api.soundcloud.com/tracks/" + trackID + "/stream?client_id=" + SOUNDCLOUD_CLIENT)
	playing = true
	trackStreaming.pipe(speakersPipe);
}

io.sockets.on('connection', function (socket) {

  socket.on('set username', function(userName) {
    // Is this an existing user name?
    if (clients[userName] === undefined) {
      // Does not exist ... so, proceed
      clients[userName] = socket.id;
      socketsOfClients[socket.id] = userName;
      userNameAvailable(socket.id, userName);
      userJoined(userName);
    } else
    if (clients[userName] === socket.id) {
      // Ignore for now
    } else {
      userNameAlreadyInUse(socket.id, userName);
    }
  })


  socket.on('disconnect', function() {
    var uName = socketsOfClients[socket.id];
    delete socketsOfClients[socket.id];
    delete clients[uName];
 
    // relay this message to all the clients
 
    userLeft(uName);
  })

  socket.on('streamTrack', function(trackID) {
  	streamTrack(trackID)
  })
})

function userJoined(uName) {
  Object.keys(socketsOfClients).forEach(function(sId) {
  	if (clients[uName] !== sId) {
    	io.sockets.sockets[sId].emit('userJoined', { "userName": uName });
  	}
  })
}
 
function userLeft(uName) {
    io.sockets.emit('userLeft', { "userName": uName });
}

function userNameAvailable(sId, uName) {
  setTimeout(function() {
 
    console.log('Sending welcome msg to ' + uName + ' at ' + sId);
    io.sockets.sockets[sId].emit('welcome', { "userName" : uName, "currentUsers": JSON.stringify(Object.keys(clients)) });
 
  }, 500);
}

function userNameAlreadyInUse(sId, uName) {
  setTimeout(function() {
    io.sockets.sockets[sId].emit('error', { "userNameInUse" : true });
  }, 500);
}

console.log("Listening on port " + PORT)
server.listen(PORT)