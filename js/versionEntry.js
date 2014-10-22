/**
 * The class for versions
 * @param revision Revision number of this version
 * @param netid Netid of committer
 * @param message Message of commit
 * @param date Date of commit
 * @constructor Saves params to instance variables
 */
exports.Version = function(revision, netid, message, date) {
    this.revision = revision;
    this.netid = netid;
    this.message = message;
    this.date = date;
};