var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MachineRealTimeDataSchema = new Schema({    
    MachineID: Number,    
    TimeStamp: { type: Date },
    DrivingMotorCurrent : Number,     
    HoistingMotorCurrent: Number,         
    ForkMotorCurrent: Number        
});

module.exports = mongoose.model('MachineRealTimeDataSchema', MachineRealTimeDataSchema, 'MachineRealTimeData');