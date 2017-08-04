var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlarmDataSchema = new Schema({
    Code: Number,
    Level: Number,
    Message: String
});

module.exports = mongoose.model('AlarmDataSchema', AlarmDataSchema, "AlarmData");