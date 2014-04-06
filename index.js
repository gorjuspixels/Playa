var express = require('express');
var app = express();

app.set('views', __dirname + '/');
app.set('view engine', 'html');

app.get('/', function(req, res){
  res.render('index.html');
});

app.listen(3000);