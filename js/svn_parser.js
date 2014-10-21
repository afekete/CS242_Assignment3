/**
 * Created by Alec on 10/20/2014.
 */
var project = require('./projectEntry.js');
var file = require('./fileEntry.js');

exports.list_parser = function (parsedXml, projects) {
    parsedXml.forEach(function (element, index, array) {
        var name = getProjectName(String(element.name));
        if(!(name in projects)) {
            projects[name] = new project.Project(name, element.commit[0].date, element.commit[0].$.revision, null, {});
        }
        if(element.$.kind == 'file') {
            var newFile = new file.File(element.size, getFiletype(String(element.name)), element.name, {});
            projects[name].files[getFilename(String(element.name))] = newFile;
        }
        var date = Date.parse(element.commit[0].date);
        var oldDate = Date.parse(projects[name].date);
        if (date > oldDate) {
            projects[name].date = date;
        }
        var revision = element.commit[0].$.revision;
        if (revision > projects[name].version) {
            projects[name].version = revision;
        }
    });
    return projects
};

exports.log_parser = function (parsedXml, projects) {
    parsedXml.forEach(function (element, index, array) {
        var projectName = getProjectName(String(element.paths));
    })
};

function getProjectName (name) {
    return name.split("/")[0];
}

function getFiletype (file) {
    var dotIndex = file.lastIndexOf('.');
    if (dotIndex == -1) {
        return "No filetype specified";
    } else {
        return file.substring(file.lastIndexOf('.'), file.length)
    }
}
function getFilename (file) {
    return file.substring(file.lastIndexOf('/')+1, file.length)
}

