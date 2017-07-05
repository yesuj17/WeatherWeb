var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserInfoSchema = new Schema({
    UserName    : String,
    UserEmail   : String,
    UserPhone   : String,
    Completed   : Boolean
});

module.exports = mongoose.model('UserInfoSchema', UserInfoSchema);