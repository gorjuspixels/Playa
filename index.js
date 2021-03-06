var express = require('express')
  , app = express()
	, server = require('http').createServer(app)
	, io = require('socket.io').listen(server)
	, request = require('request')
	, Lame = require('lame')
	, Speaker = require('speaker')
	, colors = require('colors');


app.use("/", express.static(__dirname + '/'))

var PORT = 3000
var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"
var SOUNDCLOUD_SECRET = "8bbad1fd360dce19be13d05102d55985"

var playing = false
var clients = {}
var socketsOfClients = {}
var trackStreaming;
var currentID;

var lame = new Lame.Decoder()
var speakersPipe = lame.on('format', function (format) {
			    this.pipe(new Speaker(format))
			  })

var trackListHTML = ''
var tracks = []

app.get('/', function(req, res){
  res.sendfile('views/index.html')
})

io.set('log level', 1); // reduce logging

var NUMBER_OF_TRACKS = 25

console.log(("Retrieving data from RFID reader...").yellow)
getRandomTracks(NUMBER_OF_TRACKS, function(){
	console.log(("Successfully retrieved " + NUMBER_OF_TRACKS + " tracks!").green)
})


function streamTrack(trackID) {

	currentID = trackID

	if (playing) {
		speakersPipe.unpipe()
		lame = new Lame.Decoder()
		speakersPipe = lame.on('format', function (format) {
			    this.pipe(new Speaker(format));
			  })
	}

	trackStreaming = request("http://api.soundcloud.com/tracks/" + currentID + "/stream?client_id=" + SOUNDCLOUD_CLIENT)
	playing = true
	trackStreaming.pipe(speakersPipe)

	for(var i=0; i<NUMBER_OF_TRACKS; i++) {
		var track = tracks[i]
		if (track.id == currentID) {
			io.sockets.emit('nowPlaying', { "title": track.title, "artist": track.user.username, "trackID": track.id});
			break;
		}
	}	
}

function getTrackInfo(trackID, callback) {
	request("http://api.soundcloud.com/tracks/" + trackID + ".json?client_id=" + SOUNDCLOUD_CLIENT, function(err, res, body) {
		callback(JSON.parse(body))
	})
}

function getRandomTracks(n, callback) {

	request("http://api.soundcloud.com/tracks.json?client_id=" + SOUNDCLOUD_CLIENT + "&limit=" + n, function(err, res, body) {

			tracks = JSON.parse(body)
			tracks.forEach(function(track) {
				trackListHTML += '<a href="#" class="list-group-item" data-track-id="' + track.id + '">' + track.title + ' - by ' + track.user.username + '</a>'
			})

			callback()
	})
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
    io.sockets.sockets[sId].emit('welcome', { "userName" : uName, "currentUsers": JSON.stringify(Object.keys(clients)), 'tracksHTML': trackListHTML });
 
  }, 500);
}

function userNameAlreadyInUse(sId, uName) {
  setTimeout(function() {
    io.sockets.sockets[sId].emit('error', { "userNameInUse" : true });
  }, 500);
}

console.log("Listening on port " + PORT)
server.listen(PORT)