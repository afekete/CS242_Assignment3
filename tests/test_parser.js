/**
 * Created by Alec on 10/22/2014.
 */
var xml2js = require('xml2js');
var fs = require('fs');
var async = require('async');
var parse = require('../js/svn_parser.js');

// Reads in and parses a simple list and makes sure it has correct values in the deepest part of the hierarchy
// Does not test for bad input because the function cannot handle bad input
exports.listTest = function(test){
    var parser = new xml2js.Parser();
    var list_parsed = {};
    data = fs.readFileSync(__dirname + '/test_list.xml');
    parser.parseString(data, function (err, result) {
        list_parsed = parse.list_parser(result.lists.list[0].entry, list_parsed);
    });
    test.equal(list_parsed['TestProject'].files['TestFile.txt'].size, 4404);
    test.equal(list_parsed['TestProject'].files['TestFile2.txt'].size, 1234);
    test.done();
};

// Reads in and parses a simple list, then a simple log. Then makes sure it has values the log should have added
exports.logTest = function(test){
    var parser = new xml2js.Parser();
    var log_parsed = {};
    data = fs.readFileSync(__dirname + '/test_list.xml');
    parser.parseString(data, function (err, result) {
        log_parsed = parse.list_parser(result.lists.list[0].entry, log_parsed);
    });
    data = fs.readFileSync(__dirname + '/test_log.xml');
    parser.parseString(data, function (err, result) {
        log_parsed = parse.log_parser(result.log.logentry, log_parsed);
    });
    test.equal(log_parsed['TestProject'].summary, 'Test message');
    test.equal(log_parsed['TestProject'].files['TestFile.txt'].versions[0].netid, 'fekete2');
    test.done();
};
