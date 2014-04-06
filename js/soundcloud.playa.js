var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"
var DOMAIN = "192.168.1.110:3000"
var socket = io.connect("http://" + DOMAIN)
var myUserName

var tracks = [
	"https://soundcloud.com/arthyum/red-hot-chili-peppers",
	"https://soundcloud.com/dualseize/suicide-doors",
	"https://soundcloud.com/sikdope/faithless-insomnia-sikdope"
]

SC.initialize({
  client_id: SOUNDCLOUD_CLIENT,
  redirect_uri: "http://127.0.0.1:3000/callback.html",
});

// SC.oEmbed(tracks[0], {auto_play: true}, function(oembed){
// 	$(function() {
// 		$('body').prepend(oembed.html);
// 	})
// });


var playing = false;
var currentTrackID = 0;


socket.on('welcome', function(msg) {
	var p = "<p class='alert alert-success'>Username " + msg.userName + " is available. You can begin using Playa.</p>"
  $("#msgScreen").append(p)

  tracks.forEach(function(track) {
		getSCURI(track, function(streamTrack) {
			var trackListHTML = '<a href="#" class="list-group-item" data-track-id="' + streamTrack.id + '">' + streamTrack.title + '</a>'
			$('#trackList').append(trackListHTML)
		})
	})
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


$(function() {
	$("#usernameInput").keyup(function (e) {
    if (e.keyCode == 13) {
      socket.emit('set username', $("#usernameInput").val());
    }
	});
})


/**
 * curl -v 'http://api.soundcloud.com/resolve.json?url=http://soundcloud.com/matas/hobnotropic&client_id=YOUR_CLIENT_ID'
 * Takes a SoundCloud URL and converts it into URI for streaming
 */
function getSCURI(url, callback) {

	$.ajax({
		url: "http://api.soundcloud.com/resolve.json?url=" + url + "&client_id=" + SOUNDCLOUD_CLIENT,
		success: function(track) {
			console.log(track)
			callback(track) 
		}
	})

}

function pause(){


}

function play(trackID){
	currentTrackID = trackID;
	socket.emit('streamTrack', currentTrackID);
}

$(document).ready(function() {

	$(document).on('click', '#trackList a', function() {
		play($(this).data('track-id'))
	})


	$('#play').click(function() {
		if(playing){
			pause();
			playing = false;

		}else{
			if (currentTrackID == 0) 
				currentTrackID = $('#trackList a').data('track-id')
			play(currentTrackID);
			playing = true;
		}
	})
})
