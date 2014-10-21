var express = require('express');
var xml2js = require('xml2js');
var fs = require('fs');
var util = require('util');
var parse = require('./js/svn_parser.js');
var app = express();

var list_parser = new xml2js.Parser();
var log_parser = new xml2js.Parser();
var svn_list, svn_log;
var project_list = {};
fs.readFile(__dirname + '/svn_list.xml', function (err, data) {
    list_parser.parseString(data, function (err, result) {
        svn_list = result;
        console.log(util.inspect(result.lists.list[0].entry[0], false, null));
        project_list = parse.list_parser(result.lists.list[0].entry, project_list)
    })
});
fs.readFile(__dirname + '/svn_log.xml', function (err, data) {
    log_parser.parseString(data, function (err, result) {
        svn_log = result;
    })
});

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'jade');

app.get('/', function (req, res) {
	res.render('index', { title: 'CS242 Portfolio', message: 'Hi world', project_list: project_list, svn_log: svn_log.log.logentry[0].msg})
});

var server = app.listen(4567, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Portfolio app listening at http://%s:%s', host, port)
});