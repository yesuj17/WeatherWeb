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
                where('TotalStartTime').lt(period.startDate).
                where('MachineID').equals(deviceID).
                select('MachineID TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('-TotalStartTime').
                exec(function (err, doc) {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    next(err, doc);
                });
        },
        function (doc, next) {
            MachineCycleDataSchema.
                find().
                where("TotalStartTime").gte(period.startDate).
                where("TotalEndTime").lte(period.endDate).
                where('MachineID').equals(deviceID).
                select('MachineID TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('TotalStartTime').
                exec(function (err, docs) {
                    if (err) {
                        console.error(err);
                        return false;
                    }

                    next(err, doc, docs);
                });
        },
        function (doc, docs, next) {
            /* Post processing data */
            var machineCycleDataList = [];
            machineCycleDataList.push(doc);
            var resultMachineCycleDataList
                = machineCycleDataList.concat(docs);

            next(resultMachineCycleDataList);
        }
    ], next);
}
