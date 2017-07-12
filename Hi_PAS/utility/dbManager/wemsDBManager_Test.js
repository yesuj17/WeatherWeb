var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');
var async = require('async');
var performance = require("performance-now");

var mongoose = require('mongoose');
mongoose.set('debug', true)

// Insert to Mongo DB
// Update to Mongo DB
// Select from Mongo DB
module.exports.getMachineCycleData = getMachineCycleData;

module.exports.getMachineCycleDataOne = getMachineCycleDataOne;
module.exports.getMachineCycleDataTwo = getMachineCycleDataTwo

// Delete from Mongo DB

// WEMS DB Manager Function
// Get Machine Cycle Data
function getMachineCycleDataOne(period, deviceID, next) {
    async.waterfall([
        function (next) {
            MachineCycleDataSchema.
                findOne().
                where('MachineID').equals(deviceID).
                where('TotalStartTime').lt(period.startDate).
                select('MachineID TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('-TotalStartTime').
                exec(function (err, doc) {
                    next(err, doc);
                });
        }
    ], next);
}


function getMachineCycleDataTwo(period, next) {
    async.waterfall([
        function (next) {
            console.log(period.startDate);
            MachineCycleDataSchema.
                find({
                    $and: [
                        { TotalStartTime: { $gte: period.startDate } },
                        { TotalEndTime: { $lte: period.endDate } }
                    ]
                }).
                select('MachineID TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                lean().
                exec(function (err, docs) {
                    next(err, docs);
                });
        }
    ], next);
}






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
                where('MachineID').equals(deviceID).
                where("TotalStartTime").gte(period.startDate).
                where("TotalEndTime").lte(period.endDate).
                select('MachineID TotalStartTime TotalEndTime DrivingInfo HoistingInfo ForkInfo').
                sort('TotalStartTime').
                lean().
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
