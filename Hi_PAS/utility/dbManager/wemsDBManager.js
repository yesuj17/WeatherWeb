﻿var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');
var ManagementDataSchema = require('../../models/dbSchema/ManagementDataSchema.js');
var MachineInfoSchema = require('../../models/dbSchema/MachineInfoSchema.js');
var AlarmDataSchema = require('../../models/dbSchema/AlarmDataSchema.js');
var AlarmLevelSchema = require('../../models/dbSchema/AlarmLevelSchema.js');
var commonUtil = require('../commonUtil.js');
var async = require('async');

/* XXX For Fill Default Data */
var mongoose = require('mongoose');
initializeDefaultData();

// Insert to Mongo DB
// Update to Mongo DB
module.exports.updateManagementData = updateManagementData;

// Select from Mongo DB
module.exports.getMachineCycleData = getMachineCycleData;
module.exports.getManagementData = getManagementData;
module.exports.getMachineIDList = getMachineIDList;
module.exports.getTotalAlarmMessage = getTotalAlarmMessage;

// Delete from Mongo DB

// WEMS DB Manager Function
// Get Machine Cycle Data
function getMachineCycleData(period, deviceID, next) {
    async.waterfall([
        function (next) {
            MachineCycleDataSchema.
                findOne().
                where('MachineID').equals(deviceID).
                where('TotalStartTime').lt(period.startDate).
                select('MachineID TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('-TotalStartTime').
                lean().
                exec(function (err, doc) {
                    next(err, doc);
                });
        },
        function (doc, next) {
            MachineCycleDataSchema.
                find().
                where('MachineID').equals(deviceID).
                where("TotalStartTime").gte(period.startDate).
                where("TotalEndTime").lte(period.endDate).
                select('MachineID TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('TotalStartTime').
                lean().
                exec(function (err, docs) {
                    var machineCycleDataList = [];
                    machineCycleDataList.push(doc);
                    var resultMachineCycleDataList
                        = machineCycleDataList.concat(docs);

                    next(null, resultMachineCycleDataList);
                });
        }
    ], next);
}

// Get Management Data.
function getManagementData(next) {
    async.waterfall([
        function (next) {
            ManagementDataSchema.
                findOne({}).
                exec(function (err, managementData) {
                    if (!managementData) {
                        managementData = new ManagementDataSchema();
                        /* XXX Defualt 값 결정 필요 */
                        managementData.Threshold1 = 80;
                        managementData.Threshold2 = 90;
                        managementData.StandardPower = 600000;
                        managementData.Cost = 0.3;
                    }

                    next(err, managementData);
                });
        },
        function (managementData, next) {
            managementData.save(function (err) {
                next(err, managementData);
            });
        }
    ], next);
}

// Update Management Data
function updateManagementData(param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }

    ManagementDataSchema.
        findOneAndUpdate({}, param, { upsert: true }).
        exec(function (err, managementData) {
        if (err) {
            next(false, err);
            return;
        }

        // Null인 경우 Document가 Creat되므로 Return true
        if (!managementData) {
            next(true);
            return;
        }

        managementData.Threshold1 = param.Threshold1;
        managementData.Threshold2 = param.Threshold2;
        managementData.StandardPower = param.StandardPower;
        managementData.Cost = param.Cost;

        managementData.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

// Get Machine ID List
function getMachineIDList(machineType, next) {
    MachineInfoSchema.
        find().
        where('Type').equals(machineType).
        select('ID').
        sort('ID').
        lean().
        exec(function (err, machineIDList) {
            if (err) {
                next(err);
                return;
            }

            next(err, machineIDList);
            return;
        });
}

// Get Total Alarm Message
function getTotalAlarmMessage(next) {
    async.waterfall([
        function (next) {
            AlarmDataSchema.
                find().
                lean().
                exec(function (err, alarmDatas) {
                    next(err, alarmDatas);
                });
        },
        function (alarmDatas, next) {
            AlarmLevelSchema.
                find().
                lean().
                exec(function (err, alarmLevels) {
                    for (var alarmDataIndex = 0;
                        alarmDataIndex < alarmDatas.length;
                        alarmDataIndex++) {
                        for (var alarmLevelIndex = 0;
                            alarmLevelIndex < alarmLevels.length;
                            alarmLevelIndex++) {
                            if (alarmDatas[alarmDataIndex].Level
                                === alarmLevels[alarmLevelIndex].LevelCode) {
                                alarmDatas[alarmDataIndex].Level
                                    = alarmLevels[alarmLevelIndex].Level;
                                alarmDatas[alarmDataIndex].LevelCode
                                    = alarmLevels[alarmLevelIndex].LevelCode;
                            }
                        }
                    }

                    next(err, alarmDatas);
                });
        }
    ], next);
}


////////////////////////////////////////////////////////////////////
// XXX For Add Default DB : Must Remove
function initializeDefaultData() {
    mongoose.connection.db.listCollections({ name: 'AlarmData' })
        .next(function (err, collinfo) {
            if (!collinfo) {
                /// Fill Default Alarm Message & Level
                var alarmMessages = [];
                var alarmMessage1 = {
                    Code: 1,
                    Level: 1,
                    Message: "전력량 효율이 경고 기준값 이하로 떨어졌습니다."
                };

                alarmMessages.push(alarmMessage1);

                var alarmMessage2 = {
                    Code: 2,
                    Level: 2,
                    Message: "전력량 효율이 오류 기준값 이하로 떨어졌습니다."
                };

                alarmMessages.push(alarmMessage2);

                AlarmDataSchema
                    .insertMany(alarmMessages, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
            }
        });

    mongoose.connection.db.listCollections({ name: 'AlarmLevel' })
        .next(function (err, collinfo) {
            if (!collinfo) {
                var alarmLevels = [];
                var alarmLevel1 = {
                    LevelCode: 0,
                    Level: "Info"
                };

                alarmLevels.push(alarmLevel1);

                var alarmLevel2 = {
                    LevelCode: 1,
                    Level: "Warning"
                };

                alarmLevels.push(alarmLevel2);

                var alarmLevel3 = {
                    LevelCode: 2,
                    Level: "Error"
                };

                alarmLevels.push(alarmLevel3);

                AlarmLevelSchema
                    .insertMany(alarmLevels, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
            }
        });
}
