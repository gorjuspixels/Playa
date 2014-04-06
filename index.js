var express = require('express')
var app = express()

var PORT = 3000
var SOUNDCLOUD_CLIENT = "8232a972fc27da0d122b41211218729f"
var SOUNDCLOUD_SECRET = "8bbad1fd360dce19be13d05102d55985"

app.get('/', function(req, res){
  res.sendfile('views/index.html')
})

console.log("Listening on port " + PORT)
app.listen(PORT)