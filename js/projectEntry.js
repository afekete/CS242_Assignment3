/**
 * The class for projects
 * @param title Project title (name of top level folder)
 * @param date Date of most recent commit to project
 * @param version Most recent revision number
 * @param summary Last commit message (not a good summary)
 * @param files A dictionary of files in the project (filename: file)
 * @constructor Saves params to instance variables
 */
exports.Project = function(title, date, version, summary, files) {
    this.title = title;
    this.date = date;
    this.version = version;
    this.summary = summary;
    this.files = files;
};
