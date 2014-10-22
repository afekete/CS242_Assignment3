/**
 * The class for files
 * @param size Size of the file
 * @param type Type of the file (with .)
 * @param path Path of the file starting with project folder
 *              and containing the file name and type
 * @param versions An array of the versions of the files
 * @constructor Saves params into instance variables
 */
exports.File = function (size, type, path, versions) {
    this.size = size;
    this.type = type;
    this.path = path;
    this.versions = versions;
};