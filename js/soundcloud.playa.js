var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"
var SOUNDCLOUD_SECRET = "8bbad1fd360dce19be13d05102d55985"

SC.initialize({
  client_id: SOUNDCLOUD_CLIENT,
  redirect_uri: "http://127.0.0.1:3000/callback.html",
});

SC.get("/groups/55517/tracks", {limit: 1}, function(tracks){
  alert("Latest track: " + tracks[0].title);
});


var playing = false;

$('#play').click(function() {
	if(playing){
		pause();
		playing = false;

	}else{
		play();
		playing = true;
	}
	
	
})

function pause(){


}
function play(){


}