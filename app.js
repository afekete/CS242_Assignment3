var express = require('express');
var xml2js = require('xml2js');
var async = require('async');
var h5bp = require('h5bp');
var fs = require('fs');
var util = require('util');
var parse = require('./js/svn_parser.js');
//create express server
var app = express();

// Create xml2js parser objects. One object per file to prevent overwriting errors
var list_parser = new xml2js.Parser();
var log_parser = new xml2js.Parser();
// These hold the result of the xml2js parsers
var svn_list, svn_log;
// This will hold my dictionary of projects
var project_list = {};

// Parse both files in parallel, then reorganize the parsed xml into project_list
// by parsing the list, then the log
async.parallel([
    function(callback) {
        fs.readFile(__dirname + '/svn_list.xml', function (err, data) {
            list_parser.parseString(data, function (err, result) {
                svn_list = result;
                callback(0, null)
            })
        });
    },
    function(callback) {
        fs.readFile(__dirname + '/svn_log.xml', function (err, data) {
            log_parser.parseString(data, function (err, result) {
                svn_log = result;
                callback(0, null)
            })
        });
    }
],
function(err, results) {
    project_list = parse.list_parser(svn_list.lists.list[0].entry, project_list);
    project_list = parse.log_parser(svn_log.log.logentry, project_list);

});

// Set the location of the jade files and set the view engine to jade
app.set('views', './views');
app.set('view engine', 'jade');

// Set up middleware (tell html5 boilerplate where html will be, set which folders serve static content)
app.use(h5bp({ root: __dirname + '/views' }));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

// Set what to render when a get request is made at /
app.get('/', function (req, res) {
	res.render('index', { title: 'CS242 Portfolio', project_list: project_list})
});

// Set up the server to listen at the correct port (provided by heroku or 4567 on local host)
var server = app.listen(process.env.PORT || 4567, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Portfolio app listening at http://%s:%s', host, port)
});