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
        },
        function (callback) {
            pdasDBManager.getPerformanceSummaryData(fromDate, toDate, period, callback);
        }
    ], function (err, result) {
        if (err) {
            console.log(err.message);
            if (err.message == "ns doesn't exist") {
                return res.end();
            }
            else
                return res.status(500).send('Database access failure.');
        }
        else {
            var resResult = {
                Machines:       [],
                CurrentData:    {},
                CycleTimeData:  {},
                IStockRateData: {},
                OEESummaryData: {},
                OEETrendData: {}
            };
            setResponseCurrentData(result[0], resResult);
            setResponseCycleTimeData(result[1], resResult, callback);
            function callback(err) {
                if (err) {
                    return res.status(500).send(err);
                }
                else {
                    setResponseOEEData(result[2], resResult);
                    return res.json(resResult);
                }
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
    machines.sort(function(a,b){return a-b;});
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
            subDatas[ipx] = (element.value.DrivingMotorCurrentAvg * 0.001).toFixed(1);
            subDatas = resDataSets.dataSets[motorInx[mcInx] + 1].datas;
            subDatas[ipx] = (element.value.HoistingMotorCurrentAvg * 0.001).toFixed(1);
            subDatas = resDataSets.dataSets[motorInx[mcInx] + 2].datas;
            subDatas[ipx] = (element.value.ForkMotorCurrentAvg * 0.001).toFixed(1);
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
        machineInfo.forEach(function (data) {
            var cellCnt = data.CellCount;
            var cycleTimeAvg = 0;
            var stockRate = 0;

            cycleTimeDataSets.labels.push(data.ID);
            iStockRateDataSets.labels.push(data.ID);
            datas.forEach(setDataSet);
            function setDataSet(element) {
                if (data.ID == element.value.MachineID) {
                    cycleTimeAvg = element.value.cycleTimeAvg;
                    stockRate = element.value.iStockAvg / cellCnt;
                    if(stockRate > 1)
                        stockRate = 1;
                    return;
                }
            }
            cycleDataset.data.push(cycleTimeAvg);
            iStockDataset.data.push(stockRate);
        });
        cycleTimeDataSets.datasets.push(cycleDataset);
        iStockRateDataSets.datasets.push(iStockDataset);
        
        resResult.CycleTimeData = cycleTimeDataSets;
        resResult.IStockRateData = iStockRateDataSets;
        return FnEnd();
    }
}


function setResponseOEEData(datas, rsResult) {
    var oeeRawData = datas[0].slice(0);
    var errData = datas[1].slice(0);
    var OEESummary = {
        OEE: '',
        IStockRate: '',
        BalancingRate: '',
        Yield: ''
    }
    var OEETrendData = {
        labels: [],
        datasets:[]
    }

    var totalIStockRate = 0;
    var totalBalancingRate = 0;
    var totalYield = 0;
    var oeeDataset = {
        label: 'OEE',
        data: []
    };
    var iStockRateDataset = {
        label: '재고율',
        data: []
    };
    for (var ipx in oeeRawData) {
        OEETrendData.labels.push(oeeRawData[ipx]._id);
        var balancingRate = oeeRawData[ipx].BalancingRate;
        var iStockRate = oeeRawData[ipx].AvgIStockRate;
        var errCnt = 0;
        errData.forEach(function (data) {
            if (data._id.Date.toString() != oeeRawData[ipx]._id.toString())
                return;
            errCnt = data.TotalErrCnt;
            return;
        });
        var yieldRate = oeeRawData[ipx].TotalCycleCount - errCnt;
        yieldRate = yieldRate / oeeRawData[ipx].TotalCycleCount;
        totalIStockRate += iStockRate;
        totalBalancingRate += balancingRate;
        totalYield += yieldRate;
        oeeDataset.data.push((balancingRate * yieldRate));
        iStockRateDataset.data.push(iStockRate);
    }
    OEETrendData.datasets.push(oeeDataset);
    OEETrendData.datasets.push(iStockRateDataset);

    OEESummary.IStockRate = (totalIStockRate / oeeRawData.length);
    if(OEESummary.IStockRate > 1)
        OEESummary.IStockRate = 1;
    OEESummary.BalancingRate = (totalBalancingRate / oeeRawData.length);
    OEESummary.Yield = (totalYield / oeeRawData.length);
    OEESummary.OEE = (OEESummary.BalancingRate * OEESummary.Yield); 

    rsResult.OEESummaryData = OEESummary;
    rsResult.OEETrendData = OEETrendData;
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