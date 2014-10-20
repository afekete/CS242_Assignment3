var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
	res.sendFile('./index.php')
});

var server = app.listen(4567, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port)

});