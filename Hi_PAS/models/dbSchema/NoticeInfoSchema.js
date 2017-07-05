var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoticeInfoSchema = new Schema({
    Title       : String,
    Content     : String,
    UserName    : String,
    Option      : String,
    StartDate   : { type: Date },
    EndDate     : { type: Date }
});

module.exports = mongoose.model('NoticeInfoSchema', NoticeInfoSchema);