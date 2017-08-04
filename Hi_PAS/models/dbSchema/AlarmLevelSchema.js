var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlarmLevelSchema = new Schema({
    LevelCode: Number,
    Level: String
});

module.exports = mongoose.model('AlarmLevelSchema', AlarmLevelSchema, "AlarmLevel");