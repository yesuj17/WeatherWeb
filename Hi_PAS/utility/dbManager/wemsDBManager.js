var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');
var ManagementDataSchema = require('../../models/dbSchema/ManagementDataSchema.js');
var async = require('async');

// Insert to Mongo DB
// Update to Mongo DB
module.exports.updateManagementData = updateManagementData;

// Select from Mongo DB
module.exports.getMachineCycleData = getMachineCycleData;
module.exports.getManagementData = getManagementData;

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
                findOne({})
                .exec(function (err, managementData) {
                    if (!managementData) {
                        managementData = new ManagementDataSchema();
                        managementData.Threshold1 = 0;
                        managementData.Threshold2 = 0;
                        managementData.StandardPower = 0;
                        managementData.Cost = 0;
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

function updateManagementData(param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }

    ManagementDataSchema.
        findOneAndUpdate({}, param, { upsert: true })
        .exec(function (err, managementData) {
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
