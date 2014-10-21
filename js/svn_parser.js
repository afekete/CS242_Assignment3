/**
 * Created by Alec on 10/20/2014.
 */
var project = require('./projectEntry.js');

exports.list_parser = function (parsedXml, projects) {
    parsedXml.forEach(function (element, index, array) {
        var name = getProjectName(String(element.name));
        if(!(name in projects)) {
            projects[name] = new project.Project(name, element.commit[0].date, element.commit[0].$.revision, null, {});
        }
        if(element.$ == 'file') {
            var file = new File(element.size, getFiletype(element.name), name, {});
            projects[name].files.push(file)
        }
        var date = Date.parse(element.commit[0].date);
        var oldDate = Date.parse(projects[name].date);
        if (date > oldDate) {
            projects[name].date = date;
        }
        var revision = element.commit[0].$.revision
        if (revision > projects[name].version) {
            projects[name].version = revision;
        }
    });
    return projects
};

function getProjectName (name) {
    return name.split("/")[0];
}

function getFiletype (file) {
    return file.substring(file.lastIndexOf('.'), file.length)
}
