var mongoose = require('mongoose');
var MachineRealTimeDataModel = require('../../models/dbSchema/MachineRealTimeDataSchema.js');
var MachineCycleDataModel = require('../../models/dbSchema/MachineCycleDataSchema.js');
var MachineInfoModel = require('../../models/dbSchema/MachineInfoSchema.js');
var async = require('async');
// Insert to Mongo DB
// Update to Mongo DB
// Select from Mongo DB
// Delete from Mongo DB
module.exports.getCurrentTrendData = function (fromDate, toDate, period, FnEnd) {
    if (!MachineRealTimeDataModel) {
        return FnEnd('Database access failure');
    }

    var mapReduceObj = {};
    mapReduceObj.scope = {
        fromDate: fromDate,
        toDate: toDate,
        period: period,
        getTimeInterval: getTimeInterval,
    };
    mapReduceObj.query = {
        TimeStamp: { $gt: fromDate, $lte: toDate }
    }
    mapReduceObj.sort = {
        TimeStamp: 1,
        MachineID: 1
    }
    //mapReduceObj.out = {
    //   replace: 'mapReduceExam'
    //   //inline: 1
    //}
    mapReduceObj.map = function () {
        var timeKey = getTimeInterval(this.TimeStamp, period);
        var key = { timeKey, MachineID: this.MachineID };
        var value = {
            DrivingMotorCurrent: this.DrivingMotorCurrent,
            DrivingMotorCurrentCnt: 1,
            HoistingMotorCurrent: this.HoistingMotorCurrent,
            HoistingMotorCurrentCnt: 1,
            ForkMotorCurrent: this.ForkMotorCurrent,
            ForkMotorCurrentCnt: 1
        };
        emit(key, value);
    }
    mapReduceObj.reduce = function (key, values) {
        var rtn = { a: values }
        var reducedVal = {
            DrivingMotorCurrent: 0,
            DrivingMotorCurrentCnt: 0,
            HoistingMotorCurrent: 0,
            HoistingMotorCurrentCnt: 0,
            ForkMotorCurrent: 0,
            ForkMotorCurrentCnt: 0
        };
        values.forEach(function (value) {
            reducedVal.DrivingMotorCurrent += value.DrivingMotorCurrent;
            reducedVal.DrivingMotorCurrentCnt += value.DrivingMotorCurrentCnt;
            reducedVal.HoistingMotorCurrent += value.HoistingMotorCurrent;
            reducedVal.HoistingMotorCurrentCnt += value.HoistingMotorCurrentCnt;
            reducedVal.ForkMotorCurrent += value.ForkMotorCurrent;
            reducedVal.ForkMotorCurrentCnt += value.ForkMotorCurrentCnt;
        });
        return reducedVal;
    }
    mapReduceObj.finalize = function (key, reducedVal) {
        var result = {
            MachineID: key.MachineID,
            TimeStamp: key.timeKey,
            DrivingMotorCurrentAvg: reducedVal.DrivingMotorCurrent / reducedVal.DrivingMotorCurrentCnt,
            HoistingMotorCurrentAvg: reducedVal.HoistingMotorCurrent / reducedVal.HoistingMotorCurrentCnt,
            ForkMotorCurrentAvg: reducedVal.ForkMotorCurrent / reducedVal.ForkMotorCurrentCnt
        };
        return result;
    }

    MachineRealTimeDataModel.mapReduce(mapReduceObj, callback);
    function callback(err, datas, stats) {
        if (err)
            return FnEnd(err.message);
        else {
            console.log('process time:' + stats.processtime + '(ms), target Data cnt:' + stats.counts.emit);
            return FnEnd(null, datas);
        }
    }
}

module.exports.getCycleTimeData = function (fromDate, toDate, FnEnd) {
    if (!MachineCycleDataModel) {
        return FnEnd('Database access failure');
    }

    var mapReduceObj = {};
    mapReduceObj.scope = {
        fromDate: fromDate,
        toDate: toDate,
    };
    mapReduceObj.query = {
        TotalStartTime: { $gt: fromDate, $lte: toDate }
    }
    mapReduceObj.sort = {
        MachineID: 1,
        TotalStartTime: 1
    }
    //mapReduceObj.out = {
    //   replace: 'mapReduceExam'
    //   //inline: 1
    //}
    mapReduceObj.map = function () {
        var key = { MachineID: this.MachineID };
        var value = {
            CycleTimeSum: (this.TotalEndTime - this.TotalStartTime),
            TotalCycleCount: 1,
            iStockSum: this.InventoryCount,
            TotaliStockCnt: 1
        };
        emit(key, value);
    }
    mapReduceObj.reduce = function (key, values) {
        var reducedVal = {
            CycleTimeSum: 0,
            TotalCycleCount: 0,
            iStockSum: 0,
            TotaliStockCnt: 0
        };
        values.forEach(function (value) {
            reducedVal.CycleTimeSum += value.CycleTimeSum;
            reducedVal.TotalCycleCount += value.TotalCycleCount;
            reducedVal.iStockSum += value.iStockSum;
            reducedVal.TotaliStockCnt += value.TotaliStockCnt;
        });
        return reducedVal;
    }
    mapReduceObj.finalize = function (key, reducedVal) {
        var result = {
            MachineID: key.MachineID,
            cycleTimeAvg: reducedVal.CycleTimeSum / 1000 / reducedVal.TotalCycleCount,
            iStockAvg: reducedVal.iStockSum / reducedVal.TotaliStockCnt
        };
        return result;
    }

    MachineCycleDataModel.mapReduce(mapReduceObj, callback);
    function callback(err, datas, stats) {
        if (err)
            return FnEnd(err.message);
        else {
            console.log('getCycleTimeData process time:' + stats.processtime + '(ms), target Data cnt:' + stats.counts.emit);
            return FnEnd(null, datas);
        }
    }
}

module.exports.getCellCountForAllMachine = function (machineType, FnEnd) {
    if (!MachineInfoModel) {
        return FnEnd('Database access failure');
    }
    var query = MachineInfoModel.find().where('Type').equals(machineType)
        .select('ID CellCount').sort({ ID: 1 });

    query.exec(function(err, datas){
        if(err) {
            return FnEnd(err.message);
        }
        else {
            return FnEnd(null, datas)
        }
    });
}

var getTimeInterval = function (docDate, period) {
    var interval = 0;
    if( period < 7) {
        interval = Math.floor(docDate.getMinutes() / 15); // 15분간격 전류값 Grouping
        interval = interval * 15;
        return (new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate(), docDate.getHours(), interval));
    }
    else if( period < 30) {
        interval = Math.floor((docDate.getHours()+1) / 2);   // 2시간 간격 전류값 Grouping
        interval = interval * 2;
        return (new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate(), interval, 0, 0));
    }
    else if(period < 365) {
        interval = Math.floor((docDate.getHours()+1) / 8);   // 8시간 간격 전류값 Grouping
        print(docDate.getHours());
        interval = interval * 8;
        return (new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate(), interval, 0, 0));
    }
    else if(period < 999) {
        interval = Math.floor(docDate.getDate() / 3);   // 3일 간격 전류값 Grouping
        interval = interval * 3;
        return (new Date(docDate.getFullYear(), docDate.getMonth(), interval, 0, 0, 0));
    }
    else {
        interval = Math.floor(docDate.getMinutes() / 15);
        interval = interval * 15;
        return (new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate(), docDate.getHours(), interval));
    }
}