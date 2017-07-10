var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MachineErrorDataSchema = new Schema({
    MachineType : String,
    MachineID: Number,
    TimeStamp: { type : Date },
    JobID: Number,
    ErrCode: Number,
    ErrMsg: String    
});

module.exports = mongoose.model('MachineErrorDataSchema', MachineErrorDataSchema, 'MachineErrorData');