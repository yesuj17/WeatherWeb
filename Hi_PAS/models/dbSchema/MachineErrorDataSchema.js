var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MachineErrorDataSchema = new Schema({
    MachineType : String,
    MachineID: Number,
    CurrDate: { type : Date },
    JobNo: Number,
    ErrCode: Number,
    ErrMsg: String    
});

module.exports = mongoose.model('MachineErrorDataSchema', MachineErrorDataSchema, 'MachineErrorData');