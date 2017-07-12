var mongoose = require('mongoose');

var MachineInfoSchema = require('../../models/dbSchema/MachineInfoSchema.js');
var MachineRealTimeDataSchema = require('../../models/dbSchema/MachineRealTimeDataSchema.js');
var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');
var MachineErrorDataSchema = require('../../models/dbSchema/MachineErrorDataSchema.js');

module.exports.InitMachineDB = function (next) {
    mongoose.connection.db.listCollections({ name: 'MachineInfo' })
        .next(function (err, collinfo) {
            if (collinfo == null) {
    
                /* Make Default Data */
                var infoArray = [];
    
                for (var i = 1; i < 9; i++) {
                    var info = new MachineInfoSchema();
                    info.Type = "SC";
                    info.Name = "StackerCrane (" + i + ")";
                    info.ID = i;
                    info.CellCount = 300;
                    infoArray.push(info);
                }
    
                MachineInfoSchema
                    .insertMany(infoArray, function (err) {
                        if (err) {
                            next(false);
                            return;
                        }
    
                        next(true);
                    });
            }
            else {
                next(true);
            }            
        });
}

// Add Machine Info
module.exports.addMachineInfo = function (machineInfo, next) {
    if (machineInfo) {
        
        if (machineInfo.ID < 0) {
            next(false);
            return;
        }                   
            
        MachineInfoSchema            
        .findOne({ ID: machineInfo.ID })            
        .exec(function (err, info) {
            if (err) {
                console.log(err);
                next(false);
                return;                                                                   
            }
            
            if (!info) {
                info = new MachineInfoSchema();
                info.Type = machineInfo.Type;
                info.Name = machineInfo.Name;
                info.ID = machineInfo.ID;
            }
            else {
                info.Type = machineInfo.Type;
                info.Name = machineInfo.Name;
            }
                        
            info.save(function (err) {
                if (err) {
                    next(false);
                    return;
                }
                
                next(true);
            });                        
        });
    }
}


// Add Machine RealTime Data
module.exports.addMachineRealTimeData = function (machineRealTimeData, next) {

    if (machineRealTimeData === null) {
        next(false);
        return;
    }            

    var dataArray = [];

    for (var i in machineRealTimeData.MotorInfos) {
        var data = new MachineRealTimeDataSchema();
        data.MachineID = machineRealTimeData.MachineID;
        data.TimeStamp = new Date(machineRealTimeData.MotorInfos[i].TimeStamp);
        data.DrivingMotorCurrent = machineRealTimeData.MotorInfos[i].DrivingCurrent;
        data.HoistingMotorCurrent = machineRealTimeData.MotorInfos[i].HoistingCurrent;
        data.ForkMotorCurrent = machineRealTimeData.MotorInfos[i].ForkCurrent;

        dataArray.push(data);                    
    }
    
    MachineRealTimeDataSchema
    .insertMany(dataArray, function (err) {
        if (err) {
            next(false);
            return;
        }
        
        next(true);
    });                                        
}

// Add Machine Cycle Data
module.exports.addMachineCycleData = function (machineCycleData, next) {

    if (machineCycleData === null) {
        next(false);
        return;
    }   

    var data = new MachineCycleDataSchema();
    data.JobID = machineCycleData.JobID;
    data.JobType = machineCycleData.JobType;
    data.MachineID = machineCycleData.MachineID;
    data.TotalStartTime = new Date(machineCycleData.TotalStartTime);
    data.TotalEndTime = new Date(machineCycleData.TotalEndTime);

    for (var i in machineCycleData.DrivingInfo) {
        data.DrivingInfo.push(
            {
                MoveStartTime: new Date(machineCycleData.DrivingInfo[i].MoveStartTime),
                MoveEndTime: new Date(machineCycleData.DrivingInfo[i].MoveEndTime),
                MoveDistance: machineCycleData.DrivingInfo[i].MoveDistance,
                MotorPowerConsumption: machineCycleData.DrivingInfo[i].MotorPowerConsumption,
                MotorBreakCount: machineCycleData.DrivingInfo[i].MotorBreakCount,
                BreakMCCount: machineCycleData.DrivingInfo[i].BreakMCCount
            });
    }        

    for (var i in machineCycleData.UpperDrivingInfo) {
        data.UpperDrivingInfo.push(
            {
                BreakDiscCount: machineCycleData.UpperDrivingInfo[i].BreakDiscCount,
                BreakRollerCount: machineCycleData.UpperDrivingInfo[i].BreakRollerCount,
                BreakMCCount: machineCycleData.UpperDrivingInfo[i].BreakMCCount,
                BreakRectifierCount: machineCycleData.UpperDrivingInfo[i].BreakRectifierCount
            });
    } 

    for (var i in machineCycleData.HoistingInfo) {
        data.HoistingInfo.push(
            {
                MoveStartTime: new Date(machineCycleData.HoistingInfo[i].MoveStartTime),
                MoveEndTime: new Date(machineCycleData.HoistingInfo[i].MoveEndTime),
                MoveDistance: machineCycleData.HoistingInfo[i].MoveDistance,
                MotorPowerConsumption: machineCycleData.HoistingInfo[i].MotorPowerConsumption,
                MotorBreakCount: machineCycleData.HoistingInfo[i].MotorBreakCount,
                BreakMCCount: machineCycleData.HoistingInfo[i].BreakMCCount
            });
    } 

    for (var i in machineCycleData.ForkInfo) {
        data.ForkInfo.push(
            {
                MoveStartTime: new Date(machineCycleData.ForkInfo[i].MoveStartTime),
                MoveEndTime: new Date(machineCycleData.ForkInfo[i].MoveEndTime),
                MoveDistance: machineCycleData.ForkInfo[i].MoveDistance,
                MotorPowerConsumption: machineCycleData.ForkInfo[i].MotorPowerConsumption,
                MotorBreakCount: machineCycleData.ForkInfo[i].MotorBreakCount,
                BreakMCCount: machineCycleData.ForkInfo[i].BreakMCCount
            });
    } 

    data.LaserDistanceMeterTotalUsedTime = machineCycleData.LaserDistanceMeterTotalUsedTime;
    data.OpticalRepeaterTotalUsedTime = machineCycleData.OpticalRepeaterTotalUsedTime;
    data.Weight = machineCycleData.Weight;
    data.InventoryCount = machineCycleData.InventoryCount;

    data.save(function (err) {
        if (err) {
            console.log(err);
            next(false);
            return;
        }

        next(true);
    });   
}

// Add Machine Error Data
module.exports.addMachineErrorData = function (machineErrorData, next) {
    
    if (machineErrorData === null) {
        next(false);
        return;
    }

    for (var i in machineErrorData.ErrorInfos) {
        var data = new MachineErrorDataSchema();
        data.MachineType = machineErrorData.ErrorInfos[i].MachineType;
        data.MachineID = machineErrorData.ErrorInfos[i].MachineID;
        data.TimeStamp = new Date(machineErrorData.ErrorInfos[i].TimeStamp);
        data.JobID = machineErrorData.ErrorInfos[i].JobID;
        data.ErrCode = machineErrorData.ErrorInfos[i].ErrCode;
        data.ErrMsg = machineErrorData.ErrorInfos[i].ErrMsg;

        data.save(function (err) {
            if (err) {
                console.log(err);
                next(false);
                return;
            }

            next(true);
        });
    } 
}