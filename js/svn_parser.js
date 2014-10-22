/**
 * Created by Alec on 10/20/2014.
 */
var project = require('./projectEntry.js');
var file = require('./fileEntry.js');
var version = require('./versionEntry.js');

/**
 * Parses the list into a dictionary of projects (projectname: project) which contains
 * a dictionary of files (filename: file) which contains an array of versions
 * More information is saved at each level
 * @param parsedXml The result of xml2js parser being called on a svn_list.xml file
 * @param projects The dictionary of projects to save all data to
 * @returns {*}
 */
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

/**
 * Parses the log into an existing dictionary of projects as created by list_parser
 * For each project that exists in projects, adds the most recent message to the summary field
 * Also adds each version to each file that exists in the project
 * @param parsedXml The result of xml2js parser being called on a svn_log.xml file
 * @param projects The dictionary of projects to save all data to
 * @returns {*}
 */
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

/**
 * Returns the name of the project this is before the first / in svn_list and before the third / in svn_log
 * @param name The name property in the xml (the path of the file)
 * @param index Where to find the project name in the path
 * @returns The substring of the name that constitutes the project name
 */
function getProjectName (name, index) {
    return name.split("/")[index];
}
/**
 * Gets the type of the file. Includes the . in the type
 * @param file The name property in the xml (the path of the file)
 * @returns A string containing the filetype or "No filetype specified" if there is no . in the path
 */
function getFiletype (file) {
    var dotIndex = file.lastIndexOf('.');
    if (dotIndex == -1) {
        return "No filetype specified";
    } else {
        return file.substring(file.lastIndexOf('.'), file.length)
    }
}

/**
 * Return the name of the file including the type
 * @param file The name property in the xml (the path of the file)
 * @returns The string containing the file name
 */
function getFilename (file) {
    return file.substring(file.lastIndexOf('/')+1, file.length)
}

