var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSMaintItemLevelTypeSchema = new Schema({
    UID : Number,
    Name : String
});

module.exports = mongoose.model('PMSMaintItemLevelTypeSchema', PMSMaintItemLevelTypeSchema, "PMSMaintItemLevelType");