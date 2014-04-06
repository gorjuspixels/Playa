var express = require('express')
var app = express()
var request = require('request')


app.use("/", express.static(__dirname + '/'))

var PORT = 3000
var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"
var SOUNDCLOUD_SECRET = "8bbad1fd360dce19be13d05102d55985"

app.get('/', function(req, res){
  res.sendfile('views/index.html')
})


function getTracks() {
	request('http://www.google.com', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body) // Print the google web page.
	  }
	})
}

console.log("Listening on port " + PORT)
app.listen(PORT)