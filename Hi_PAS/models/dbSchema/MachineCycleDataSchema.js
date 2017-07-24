var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MachineCycleDataSchema = new Schema({
    JobID: Number,
    JobType: Number,
    MachineID: Number,
    TotalStartTime: {
        type: Date,
        index: true
    },
    TotalEndTime: {
        type: Date,
        index: true
    },
    DrivingInfo: [
        {
            MoveStartTime: { type : Date },
            MoveEndTime: { type : Date },
            MoveDistance: Number,
            MotorPowerConsumption: Number,
            MotorBreakCount: Number,
            BreakMCCount: Number
        }
    ],
    UpperDrivingInfo: [
        {
            BreakDiscCount: Number,
            BreakRollerCount: Number,
            BreakMCCount: Number,
            BreakRectifierCount: Number

        }
    ],
    HoistingInfo: [
        {
            MoveStartTime: { type : Date },
            MoveEndTime: { type : Date },
            MoveDistance: Number,
            MotorPowerConsumption: Number,
            MotorBreakCount: Number,
            BreakMCCount: Number
        }
    ],
    ForkInfo: [
        {
            MoveStartTime: { type : Date },
            MoveEndTime: { type : Date },
            MoveDistance: Number,
            MotorPowerConsumption: Number,
            MotorBreakCount: Number,
            BreakMCCount: Number
        }
    ],
    LaserDistanceMeterTotalUsedTime: Number,
    OpticalRepeaterTotalUsedTime: Number,
    Weight: Number,
    InventoryCount: Number        
});

module.exports = mongoose.model('MachineCycleDataSchema', MachineCycleDataSchema, 'MachineCycleData');