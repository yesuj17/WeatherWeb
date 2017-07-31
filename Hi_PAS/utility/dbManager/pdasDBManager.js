var mongoose = require('mongoose');
var MachineRealTimeDataModel = require('../../models/dbSchema/MachineRealTimeDataSchema.js');
var MachineCycleDataModel = require('../../models/dbSchema/MachineCycleDataSchema.js');
var MachineInfoModel = require('../../models/dbSchema/MachineInfoSchema.js');
var MachineErrorDataModel = require('../../models/dbSchema/MachineErrorDataSchema.js');
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
            if(value.DrivingMotorCurrent > 0)
                reducedVal.DrivingMotorCurrentCnt += value.DrivingMotorCurrentCnt;
            reducedVal.HoistingMotorCurrent += value.HoistingMotorCurrent;
            if(value.HoistingMotorCurrent)
                reducedVal.HoistingMotorCurrentCnt += value.HoistingMotorCurrentCnt;
            reducedVal.ForkMotorCurrent += value.ForkMotorCurrent;
            if(value.ForkMotorCurrent)
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
            return FnEnd(err);
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
            return FnEnd(err);
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
        return FnEnd(err, datas)
    });
}

module.exports.getPerformanceSummaryData = function(fromDate, toDate, period, FnEnd) {
     if (!MachineCycleDataModel || !MachineErrorDataModel || !MachineInfoModel) {
        return FnEnd('Database access failure');
    }
    async.series([
         function (callback) {
             getOEERawDataForEachStackerCrane(fromDate, toDate, period, callback);
         },
         function (callback) {
             getErrorCntForEachStackerCrane(fromDate, toDate, period, callback);
         }
     ], function (err, result) {
            return FnEnd(err,result);
     }); 
}

var getErrorCntForEachStackerCrane = function (fromDate, toDate, period, FnEnd) {
    if (!MachineErrorDataModel) {
        return FnEnd('Database access failure');
    }

    var group = {
        "_id": {
            'Date': {
                "$add": [{
                        "$subtract": [
                            { "$subtract": ["$CurrDate", new Date(0)] },
                            { "$mod": [
                                { "$subtract": ["$CurrDate", new Date(0)] },
                                    getNewTimeInterval(period)
                            ]}
                    ]},
                    new Date(0)
                ]
            }
        },
        'TotalErrCnt': { '$sum': { '$size': '$ErrorInfos'} }
    };

    var pipeLine = [
        { $match: { CurrDate: { $gt: fromDate, $lte: toDate } } },
        { $group: group },
        { $sort: { _id: 1 } },
    ];

    MachineErrorDataModel.aggregate(pipeLine, callback);
    function callback(err, datas) {
        return FnEnd(err, datas);
    }  
}

//var getOEERawDataForEachStackerCrane = function (fromDate, toDate, period, totalCellCnt, FnEnd) {
//    if (!MachineCycleDataModel) {
//        return FnEnd('Database access failure');
//    }

//    var group = {
//        "_id": {
//            'Date': {
//                "$add": [{
//                        "$subtract": [
//                            { "$subtract": ["$MachineCycleData.TotalStartTime", new Date(0)] },
//                            { "$mod": [
//                                { "$subtract": ["$MachineCycleData.TotalStartTime", new Date(0)] },
//                                    getNewTimeInterval(period)
//                            ]}
//                    ]},
//                    new Date(0)
//                ]
//            },
//            'MachineID' : '$ID'
//        },
//        'CellCnt': { '$avg':'$CellCount'},
//        'SumCycleCnt': { '$sum': 1 },
//        'AvgStockCnt': { '$avg': '$MachineCycleData.InventoryCount' }
//    };

//    var pipeLine = [
//        { $lookup: {
//            from: 'MachineCycleData',
//            localField: 'ID',
//            foreignField: 'MachineID',
//            as: 'MachineCycleData'
//        }},
//        { $unwind: '$MachineCycleData' },
//        { $match: { 'MachineCycleData.TotalStartTime': { $gt: fromDate, $lte: toDate } } },
//        { $group: group },
//        { $project: {
//            'SumCycleCnt': 1, 
//            'IStockRate': { '$divide': ['$AvgStockCnt', '$CellCnt'] },
//        }},
//        { $group: { '_id': '$_id.Date', 
//            'TotalCycleCount':   { '$sum': '$SumCycleCnt'},
//            'AvgCycleCount':     { '$avg': '$SumCycleCnt'},
//            'MaxCycleCount':     { '$max': '$SumCycleCnt'},
//            'AvgIStockRate':     { '$avg': '$IStockRate'}},
//        },
//        { $sort: { '_id': 1 } },
//        { $project: {
//            'TotalCycleCount':1, 'BalancingRate': { '$divide': ['$AvgCycleCount', '$MaxCycleCount']}, 'AvgIStockRate':1
//        }}
//    ];
//    var start = new Date();
//    MachineInfoModel.aggregate(pipeLine, callback);
//    function callback(err, datas) {
//        if (err)
//            console.log(err.message);
//        var end = new Date();
//        console.log((end-start)/1000);
//        return FnEnd(err, datas);
//    }
//}

var getOEERawDataForEachStackerCrane = function (fromDate, toDate, period, FnEnd) {
    if (!MachineCycleDataModel) {
        return FnEnd('Database access failure');
    }
    var group = {
        "_id": {
            'Date': {
                "$add": [
                    {
                        "$subtract": [
                            { "$subtract": ["$TotalStartTime", new Date(0)] },
                            { "$mod": [
                                    { "$subtract": ["$TotalStartTime", new Date(0)] },
                                    getNewTimeInterval(period)
                            ]}
                    ]},
                    new Date(0)
                ]
            },
            'MachineID' : '$MachineID'
        },
        'SumCycleCnt': { '$sum': 1 },
        'AvgStockCnt': {'$avg': '$InventoryCount' }
    };

    var pipeLine = [
        { $match: { TotalStartTime: { $gt: fromDate, $lte: toDate } } },
        { $group: group },
        { $lookup: {
            from: 'MachineInfo',
            localField: '_id.MachineID',
            foreignField: 'ID',
            as: 'MachineInfo'
        }},
        { $unwind: '$MachineInfo' },
        { $match: { 'MachineInfo.Type': 'SC' } },
        { $project: {
            'SumCycleCnt': 1, 
            'IStockRate': { '$divide': ['$AvgStockCnt', '$MachineInfo.CellCount'] },
        }},
        { $group: { '_id': '$_id.Date', 
            'TotalCycleCount':   { '$sum': '$SumCycleCnt'},
            'AvgCycleCount':     { '$avg': '$SumCycleCnt'},
            'MaxCycleCount':     { '$max': '$SumCycleCnt'},
            'AvgIStockRate':     { '$avg': '$IStockRate'}},
        },
        { $sort: { _id: 1 } },
        { $project: {
            'TotalCycleCount': 1, 'BalancingRate': { '$divide': ['$AvgCycleCount', '$MaxCycleCount']}, 'AvgIStockRate':1
        }}
    ];

    var start = new Date();
    MachineCycleDataModel.aggregate(pipeLine, callback);
    function callback(err, datas) {
        if (err)
            console.log(err.message);
        var end = new Date();
        console.log((end - start) / 1000);
        return FnEnd(err, datas);
    }
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

var getNewTimeInterval = function (period) {
    var interval = 0;
    if( period < 7) {
        return 1000 * 60 * 15;  // 15분
    }
    else if( period < 30) {
        return 1000 * 60 * 120; //2시간
    }
    else if(period < 365) {
        return 1000 * 60 * 480; //8시간
    }
    else if(period < 999) {
        return 1000 * 60 * 1440; //3일
    }
    else {
        return 1000 * 60 * 15;  // 15분
    }
}