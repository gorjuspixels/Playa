var express = require('express');
var app = express();

var PORT = 3000;

app.get('/', function(req, res){
  res.sendfile('views/index.html');
});

console.log("Listening on port " + PORT)
app.listen(PORT)