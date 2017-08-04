var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSSystemLogDataSchema = new Schema({
    TimeStamp: { type: Date },
    LogType: String, 
    Message: String
});

module.exports = mongoose.model('PMSSystemLogDataSchema', PMSSystemLogDataSchema, "PMSSystemLogData");