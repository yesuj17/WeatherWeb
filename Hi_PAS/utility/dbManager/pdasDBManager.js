var mongoose = require('mongoose');
var MachineRealTimeDataModel = require('../../models/dbSchema/MachineRealTimeDataSchema.js');
var async = require('async');
// Insert to Mongo DB
// Update to Mongo DB
// Select from Mongo DB
// Delete from Mongo DB
module.exports.FindCurrentData = function (fromDate, toDate, period, FnEnd) {
    if (!MachineRealTimeDataModel) {
        return FnEnd('Database access failure');
    }
    console.log('Interval start to:' + fromDate.toISOString() + ' ~ ' + toDate.toISOString());

    var mapReduceObj = {};
    mapReduceObj.scope = {
        fromDate: fromDate,
        toDate: toDate,
        period: period,
        getTimeInterval: getTimeInterval
    };
    mapReduceObj.query = {
        TimeStamp: { $gt: fromDate, $lte: toDate }
    }
    mapReduceObj.sort = {
        SCNo: 1,
        TimeStamp: 1
    }
    mapReduceObj.out = {
        replace: 'mapReduceExam'
//      inline: 1        
    }

    mapReduceObj.map = function () {
        var timeKey = getTimeInterval(this.TimeStamp, period);;
        print(timeKey.toString());
        var key = { timeKey, SCNo: this.SCNo };
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
            SCNo: key.SCNo,
            TimeStamp: key.timeKey,
            DrivingMotorCurrentAvg: reducedVal.DrivingMotorCurrent / reducedVal.DrivingMotorCurrentCnt,
            HoistingMotorCurrentAvg: reducedVal.HoistingMotorCurrent / reducedVal.HoistingMotorCurrentCnt,
            ForkMotorCurrentAvg: reducedVal.ForkMotorCurrent / reducedVal.ForkMotorCurrentCnt
        }
        return result;
    }

    MachineRealTimeDataModel.mapReduce(mapReduceObj, callback);
    function callback(err, datas, stats) {
        if (err)
            return FnEnd('MapReduce Error');
        else {
            // Todo
            // 1. Period에 따라 Interval 결정해서 리턴하는 함수 구현
            // 2. 쿼리 결과값 Json 포멧으로 저장.
            return console.log('process time:' + stats.processtime + '(ms), target Data cnt:' + stats.counts.emit);
        }
    }
}

var getTimeInterval = function(docDate, period) {
    var interval = 0;
    var targetUnit = docDate.getMinutes();
    if (targetUnit <= 14)
        interval = 0;
    else if (targetUnit <= 29)
        interval = 15;
    else if (targetUnit <= 44)
        interval = 30;
    else
        interval = 45;

    switch (period) {
        case 1: interval = period * 900000; break;  // 당일 선택시 15분단위로 Data get
        case 7: interval = period * 3600000; break;  // 일주일 선택시 6시간 단위로 
        case 30:
        case 90: interval = period * 3600000; break;  // 한달/3달 선택시 6시간 단위로
        case 365: interval = period * 86400000; break;  // 1년 선택시 하루 단위로
        default: interval = period * 600000;
    }

    return (new Date(docDate.getFullYear() + '-'
        + docDate.getMonth() + '-'
        + docDate.getDate() + 'T'
        + docDate.getHours() + ':'
        + interval + ':00:00Z'
    ));
}


