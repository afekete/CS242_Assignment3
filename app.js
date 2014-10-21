var express = require('express');
var xml2js = require('xml2js');
var async = require('async');
var fs = require('fs');
var util = require('util');
var parse = require('./js/svn_parser.js');
var app = express();

var list_parser = new xml2js.Parser();
var log_parser = new xml2js.Parser();
var svn_list, svn_log;
var project_list = {};
async.parallel([
    function(callback) {
        fs.readFile(__dirname + '/svn_list.xml', function (err, data) {
            list_parser.parseString(data, function (err, result) {
                svn_list = result;
                //console.log(util.inspect(result.lists.list[0], false, null));
                callback(0, null)
            })
        });
    },
    function(callback) {
        fs.readFile(__dirname + '/svn_log.xml', function (err, data) {
            log_parser.parseString(data, function (err, result) {
                svn_log = result;
                console.log(util.inspect(result.log.logentry, false, null));
                callback(0, null)
            })
        });
    }
],
function(err, results) {
    project_list = parse.list_parser(svn_list.lists.list[0].entry, project_list);
});

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'jade');

app.get('/', function (req, res) {
	res.render('index', { title: 'CS242 Portfolio', project_list: project_list, svn_log: svn_log.log.logentry[0].msg})
});

var server = app.listen(process.env.PORT || 4567, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Portfolio app listening at http://%s:%s', host, port)
});