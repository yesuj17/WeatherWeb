/* PdAS Restful API Handler */
var dbManager = require('../utility/dbManager/commonDBManager');
var pdasDBManager = require('../utility/dbManager/pdasDBManager');
var async = require('async');

module.exports.PdAS = function (req, res) {
    res.render('./pdas/pdas', { title: 'PdAS' });
}

module.exports.DataAnalysis = function (req, res) {
    var fromDate = new Date(req.params.fromDate);
    var toDate = new Date(req.params.toDate);
    var period = Math.floor((toDate - fromDate) / 1000 / 60 / 60 / 24);

    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    async.series([
        function (callback) {
            pdasDBManager.getCurrentTrendData(fromDate, toDate, period, callback);
        },
        function (callback) {
            pdasDBManager.getCycleTimeData(fromDate, toDate, callback);
        }
    ], function (err, result) {
        if (err) {
            console.log(err.message);
            res.status(500).send('Database access failure.');
        }
        else {
            var resResult = {
                Machines:       [],
                CurrentData:    {},
                CycleTimeData:  {},
                IStockRateData: {}
            };
            setResponseCurrentData(result[0], resResult);
            setResponseCycleTimeData(result[1], resResult, callback);
            function callback(err) {
                if(err) {
                    return res.status(500).send(err);
                }
                else
                    return res.json(resResult);
            }
        }
    });
}

function setResponseCurrentData(datas, rsResult) {
    var resDataSets = {
        labels: [],
        dataSets: []
    };
    var intervals = [];
    var machines = [];
    var motorInx = [];
    var tmpArr = [];
    datas.forEach(setLabels);
    function setLabels(element) {
        if (intervals.indexOf(element._id.timeKey.toString()) < 0) {
            intervals.push(element._id.timeKey.toString());
            resDataSets.labels.push((element._id.timeKey));
            tmpArr.push(0);
        }
        if (machines.indexOf(element._id.MachineID) < 0) {
            machines.push(element._id.MachineID);
        }
    }
    rsResult.Machines = machines;
    var motors = ['DrivingMotor', 'HoistingMotor', 'ForkMotor']
    var inx = 0;
    for (var i in machines) {
        motorInx.push(inx);
        for (var cnt = 0; cnt < 3; cnt++) {
            var dataset = new Object;
            dataset.label = machines[i] + '_' + motors[cnt];
            dataset.datas = tmpArr.slice(0);
            resDataSets.dataSets.push(dataset);
            inx++;
        }
    }
    for (var ipx in intervals) {
        datas.forEach(setDataSets);
        function setDataSets(element) {
            if (intervals[ipx] != element._id.timeKey.toString())
                return;
            var indx = ipx;
            var mcInx = machines.indexOf(element._id.MachineID);
            if (mcInx < 0)
                return;
            var subDatas = resDataSets.dataSets[motorInx[mcInx]].datas;
            subDatas[ipx] = element.value.DrivingMotorCurrentAvg.toFixed(1);
            subDatas = resDataSets.dataSets[motorInx[mcInx] + 1].datas;
            subDatas[ipx] = element.value.HoistingMotorCurrentAvg.toFixed(1);
            subDatas = resDataSets.dataSets[motorInx[mcInx] + 2].datas;
            subDatas[ipx] = element.value.ForkMotorCurrentAvg.toFixed(1);
        }
    }
    rsResult.CurrentData = resDataSets;
}

function setResponseCycleTimeData(datas, resResult, FnEnd) {

    pdasDBManager.getCellCountForAllMachine('SC',callback);
    function callback(err, machineInfo) {
        if(err)
            return FnEnd(err.message);
        var cycleTimeDataSets = {
            labels : [],
            datasets: []
        };
        var iStockRateDataSets = {
            labels: [],
            datasets: []
        };
        var cycleDataset = {
            data: []
        };
        var iStockDataset = {
            data: []
        };
        datas.forEach(setDataSet);
        function setDataSet(element) {
            var cellCnt = 0;
            machineInfo.forEach(function(data){
                if(data.ID != element.value.MachineID){
                    return;
                }
                cellCnt = data.CellCount;
            });
            cycleTimeDataSets.labels.push(element.value.MachineID);
            iStockRateDataSets.labels.push(element.value.MachineID);
            cycleDataset.data.push(element.value.cycleTimeAvg);
            iStockDataset.data.push(element.value.iStockAvg / cellCnt);
        }
        cycleTimeDataSets.datasets.push(cycleDataset);
        iStockRateDataSets.datasets.push(iStockDataset);
        
        resResult.CycleTimeData = cycleTimeDataSets;
        resResult.IStockRateData = iStockRateDataSets;
        return FnEnd();
    }
}

module.exports.CurrentData = function (req, res) {
    var machineRealTimeDataJson = require("../models/pdas/machineRealTimeData.json");
    ///var date = new Date();
    machineRealTimeDataJson.properties.TimeStamp = Date();
    machineRealTimeDataJson.properties.MachineID = 1;
    var drivingMotor = [];
    var hoistingMotor = [];
    var forkMotor = [];
    for (var n = 0; n < 3; n++) {
        var dMotor = new Object();
        dMotor.current = (Math.random() * 20) + 1;
        drivingMotor.push(dMotor);
        var HMotor = new Object();
        HMotor.current = (Math.random() * 20) + 1;
        hoistingMotor.push(HMotor);
        var FMotor = new Object();
        FMotor.current = (Math.random() * 20) + 1;
        forkMotor.push(FMotor);
    }
    machineRealTimeDataJson.properties.DrivingMotor = drivingMotor;
    machineRealTimeDataJson.properties.HoistingMotor = hoistingMotor;
    machineRealTimeDataJson.properties.ForkMotor = forkMotor;

    if (!dbManager.insertMachineCycleData(machineRealTimeDataJson)) {
        console.log("machineRealTimeDataJson Save Fail.");
    }
    else {
        console.log("machineRealTimeDataJson Save Success.");
        res.send(machineRealTimeDataJson);
    }
}
