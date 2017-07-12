var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');
var async = require('async');

// Insert to Mongo DB
// Update to Mongo DB
// Select from Mongo DB
module.exports.getMachineCycleData = getMachineCycleData;

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
