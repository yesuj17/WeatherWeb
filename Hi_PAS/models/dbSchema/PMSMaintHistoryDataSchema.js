var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSMaintHistoryDataSchema = new Schema({
    TimeStamp: { type: Date },
    MachineID: Number,
    UserID: String,
    Code: String,
    Title: String,
    Status : Number,
    ActionStatus: Number,
    Message : String    
});

module.exports = mongoose.model('PMSMaintHistoryDataSchema', PMSMaintHistoryDataSchema, "PMSMaintHistoryData");