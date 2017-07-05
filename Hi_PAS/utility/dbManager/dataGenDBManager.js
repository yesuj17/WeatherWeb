/* DB Manager */
var MachineInfoSchema = require('../../models/dbSchema/MachineInfoSchema.js');
var MachineRealTimeDataSchema = require('../../models/dbSchema/MachineRealTimeDataSchema.js');
var MachineCycleDataSchema = require('../../models/dbSchema/MachineCycleDataSchema.js');
var MachineErrorDataSchema = require('../../models/dbSchema/MachineErrorDataSchema.js');
var async = require('async');

module.exports.MachineInfoBulkInsert = function (arrData, FnEnd) {
    bulkInsert(MachineInfoSchema, arrData, FnEnd);
}

module.exports.MachineRealTimeDataBulkInsert = function (arrData, FnEnd) {
    bulkInsertForRealTimeData(arrData, FnEnd);
}

module.exports.MachineCycleDataBulkInsert = function (arrData, FnEnd) {
    bulkInsert(MachineCycleDataSchema, arrData, FnEnd);
}

module.exports.MachineErrorDataBulkInsert = function (arrData, FnEnd) {
    bulkInsert(MachineErrorDataSchema, arrData, FnEnd);
}

// Bulk Insert
function bulkInsert(Model, arrData, FnEnd) {
    if (!arrData || arrData.length < 1)
        return FnEnd('Error: Empty Data');

    console.log('Start bulk insert method');

    var bulk = Model.collection.initializeOrderedBulkOp();
    var count = 0;
    var remainCount = 0;
    var length = arrData.length;
    async.whilst(function () { return count < length; }, function (callback) {
        bulk.insert(arrData[count]);
        count++;
        remainCount++;
        if (count % 1000 === 0) {
            bulk.execute(function (err) {
                if (err) {
                    console.log('error in bulkExecute');
                    callback(err);
                }
                else {
                    console.log('Bulk execute count:' + count);
                    remainCount = 0;
                    bulk = Model.collection.initializeOrderedBulkOp();
                    callback();
                }
            });
        }
        else callback();
    }, function (err) {
        if (err) {
            console.log('error in bulk insert method');
            return FnEnd(err);
        }
        else {
            if (remainCount > 0) {
                bulk.execute(function (err) {
                    if (err) {
                        console.log('error in secondary bulkExecute');
                    }
                    else {
                        console.log('Bulk execute count:' + count);
                        return FnEnd(null, { Result: 'Success', DataCount: arrData.length });
                    }
                });
            }
            else {
                return FnEnd(null, { Result: 'Success', DataCount: arrData.length });
            }        
        }
    });
}

function bulkInsertForRealTimeData (arrData, FnEnd) {
    if (!arrData || arrData.length < 1)
        return FnEnd('Error: Empty Data');
    
    if (!MachineRealTimeDataSchema)
        return FnEnd('Error: Cannot find db schema model');
    
    console.log('Start bulk insert method for ' + 'MachineRealTimeData');
    
    var bulk = MachineRealTimeDataSchema.collection.initializeOrderedBulkOp();
    var count = 0;
    var totalDataCnt = 0;
    var remainCount = 0;
    var length = arrData.length;
    async.whilst(function () { return count < length; }, function (callback) {
        async.waterfall([
            function (cb) {
                for (var i in arrData[count].MotorInfos) {
                    var data = new MachineRealTimeDataSchema();
                    data.MachineID = arrData[count].MachineID;
                    data.TimeStamp = new Date(arrData[count].MotorInfos[i].TimeStamp);
                    data.DrivingMotorCurrent = arrData[count].MotorInfos[i].DrivingCurrent;
                    data.HoistingMotorCurrent = arrData[count].MotorInfos[i].HoistingCurrent;
                    data.ForkMotorCurrent = arrData[count].MotorInfos[i].ForkCurrent;
                    bulk.insert(data);
                    remainCount++;
                    totalDataCnt++;
                }
                cb(null);
            },
            function (cb) {
                if (totalDataCnt % 1000 === 0) {
                    bulk.execute(function (err) {
                        if (err) {
                            console.log('error in bulkExecute');
                            callback(err);
                        }
                        else {
                            console.log('Bulk execute count:' + totalDataCnt);
                            remainCount = 0;
                            bulk = MachineRealTimeDataSchema.collection.initializeOrderedBulkOp();
                            cb();
                        }
                    });
                }
                else
                    cb();
            }
        ], function (err) {
            if (err)
                return callback(err);
            else {
                count++;
                return callback();
            }
        });
    }, function (err) {
        if (err) {
            console.log('error in bulk insert method');
            return FnEnd(err);
        }
        else {
            if (remainCount > 0) {
                bulk.execute(function (err) {
                    if (err) {
                        console.log('error in secondary bulkExecute');
                    }
                    else {
                        console.log('Bulk execute count:' + count);
                        MachineRealTimeDataSchema.collection.dropIndexes();
                        MachineRealTimeDataSchema.collection.createIndex({ 'TimeStamp': 1, 'MachineID': 1 });
                        return FnEnd(null, { Title: 'MachineRealTimeData', Result: 'Success', DataCount: totalDataCnt });
                    }
                });
            }
            else {
                MachineRealTimeDataSchema.collection.dropIndexes();
                MachineRealTimeDataSchema.collection.createIndex({ 'TimeStamp': 1, 'MachineID': 1 });
                return FnEnd(null, { Title: 'MachineRealTimeData', Result: 'Success', DataCount: totalDataCnt });
            }
        }
    });
}