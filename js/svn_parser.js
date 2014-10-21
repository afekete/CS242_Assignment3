/**
 * Created by Alec on 10/20/2014.
 */
var project = require('./projectEntry.js');
var file = require('./fileEntry.js');
var version = require('./versionEntry.js');

exports.list_parser = function (parsedXml, projects) {
    parsedXml.forEach(function (element, index, array) {
        var name = getProjectName(String(element.name), 0);
        if(!(name in projects)) {
            projects[name] = new project.Project(name, element.commit[0].date, element.commit[0].$.revision, null, {});
        }
        if(element.$.kind == 'file') {
            var newFile = new file.File(element.size, getFiletype(String(element.name)), element.name, []);
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
        var projectName = getProjectName(String(element.paths[0].path[0]._), 2);
        if(!(typeof projectName === 'undefined') && !(typeof projects[projectName] === 'undefined')){

            if(projects[projectName].version == element.$.revision) {
                projects[projectName].summary = element.msg
            }
            element.paths[0].path.forEach(function (pathInfo, index, array) {
                var currFile = projects[projectName].files[getFilename(pathInfo._)];
                if(!(typeof currFile === 'undefined')) {
                    var newVersion = new version.Version(element.$.revision, element.author, element.msg, element.date);
                    currFile.versions.push(newVersion);
                }
            })
        }
    });
    return projects
};

function getProjectName (name, index) {
    return name.split("/")[index];
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

