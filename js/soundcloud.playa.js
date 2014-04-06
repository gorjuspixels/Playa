var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"

var tracks = [
	"https://soundcloud.com/arthyum/red-hot-chili-peppers",
	"https://soundcloud.com/dualseize/suicide-doors",
	"https://soundcloud.com/octobersveryown/drake-days-in-the-east"
]

SC.initialize({
  client_id: SOUNDCLOUD_CLIENT,
  redirect_uri: "http://127.0.0.1:3000/callback.html",
});

SC.oEmbed(tracks[0], {auto_play: true}, function(oembed){
	$(function() {
		$('body').prepend(oembed.html);
	})
});


tracks.forEach(function(track) {
	getSCURI(track, function(streamTrack) {
		var trackListHTML = '<a href="#" class="list-group-item" data-track-id="' + streamTrack.id + '">' + streamTrack.title + '</a>'
		$('#trackList').append(trackListHTML)
	})
})

var playing = false;
var currentTrackID = 0;




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


}

function play(trackID){
	currentTrackID = trackID;
	SC.stream("/tracks/" + currentTrackID, {
	  autoPlay: true,
	  ontimedcomments: function(comments){
	    console.log(comments[0].body);
	  }
	});
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

