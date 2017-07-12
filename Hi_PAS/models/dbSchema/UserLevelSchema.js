var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserLevelSchema = new Schema({
    LevelName   : String,
    RoleInfo    : [
        {
            Read    : [String],
            Write   : [String]
        }
    ]
});

module.exports = mongoose.model('UserLevelSchema', UserLevelSchema);