var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NoticeInfoSchema = new Schema({
    Title       : String,
    Content     : String,
    Writer      : String,
    Option      : String,
    StartDate   : { type: Date },
    EndDate     : { type: Date },
    ReadInfo    : [
        {
            name: String
        }
    ]
});

module.exports = mongoose.model('NoticeInfoSchema', NoticeInfoSchema);