var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"
var DOMAIN = "playa:3000"
var socket = io.connect("http://" + DOMAIN)
var myUserName


SC.initialize({
  client_id: SOUNDCLOUD_CLIENT
});

var playing = false;
var currentTrackID = 0;


socket.on('welcome', function(msg) {
	var p = "<p class='alert alert-success'>Username " + msg.userName + " is available. You can begin using Playa.</p>"
  $("#msgScreen").append(p)
	$('#trackList').append(msg.tracksHTML)
});

socket.on('userJoined', function(msg) {
	var p = "<p>" + msg.userName + " joined your Playa party!</p>"
  $("#msgScreen").append(p)
  $('#msgScreen').stop().animate({
	  scrollTop: $("#msgScreen")[0].scrollHeight
	}, 800);
})

socket.on('userLeft', function(msg) {
	var p = "<p>" + msg.userName + " left your Playa party.</p>"
  $("#msgScreen").append(p)
  $('#msgScreen').stop().animate({
	  scrollTop: $("#msgScreen")[0].scrollHeight
	}, 800);
})

socket.on('nowPlaying', function(track) {
	$('#play').empty()
	$('#play').append('<i class="glyphicon glyphicon-pause">Pause</i>')

	var p = "<p> Now playing " + track.title + " by " + track.artist + ".</p>"
	$("#msgScreen").append(p)
  $('#msgScreen').stop().animate({
	  scrollTop: $("#msgScreen")[0].scrollHeight
	}, 800);

  $('a.list-group-item[data-track-id="' + currentTrackID +'"]').removeClass('active')

  currentTrackID = track.trackID
	$('a.list-group-item[data-track-id="' + currentTrackID +'"]').addClass('active')
})

socket.on('paused', function(track) {
	$('#play').empty()
	$('#play').append('<i class="glyphicon glyphicon-play">Play</i>')

	var p = "<p>" + track.title + " by " + track.artist + " was paused.</p>"
	$("#msgScreen").append(p)
  $('#msgScreen').stop().animate({
	  scrollTop: $("#msgScreen")[0].scrollHeight
	}, 800);
})

socket.on('error', function(error) {
	if (error.userNameInUse) {
		var p = "<p> Sorry that nickname is already taken!</p>"
		$("#msgScreen").append(p)
	  $('#msgScreen').stop().animate({
		  scrollTop: $("#msgScreen")[0].scrollHeight
		}, 800);
	}
})


$(function() {
	$("#usernameInput").keyup(function (e) {
    if (e.keyCode == 13) {
    	$(this).blur();
      socket.emit('set username', $("#usernameInput").val());
    }
	});
})


function getTrackInfo(trackID, callback) {
	$.ajax({
		url: "http://api.soundcloud.com/tracks/" + trackID + ".json?client_id=" + SOUNDCLOUD_CLIENT,
		success: function(track) {
			callback(track) 
		}
	})
}


/**
 * curl -v 'http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/matas/hobnotropic&client_id=YOUR_CLIENT_ID'
 * Takes a SoundCloud URL and converts it into URI for streaming
 */
function getSCURI(url, callback) {

	$.ajax({
		url: "http://api.soundcloud.com/resolve.json?url=" + url + "&client_id=" + SOUNDCLOUD_CLIENT,
		success: function(track) {
			callback(track) 
		}
	})

}

function pause(){
	socket.emit('pause')
}

function play(trackID){
	socket.emit('streamTrack', trackID)
}

function resume() {
	socket.emit('resume')
}

$(document).ready(function() {

	$(document).on('click', '#trackList a', function() {
		play($(this).data('track-id'))
		playing = true
	})


	$('#play').click(function() {
		if(playing){
			pause()
			playing = false

		}else{
			if (currentTrackID == 0) 
				currentTrackID = $('#trackList a').data('track-id')
			resume()
			playing = true
		}
	})
})

