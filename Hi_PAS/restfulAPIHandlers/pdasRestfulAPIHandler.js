/* PdAS Restful API Handler */
var dbManager = require('../utility/dbManager/commonDBManager');
var pdasDBManager = require('../utility/dbManager/pdasDBManager');

module.exports.PdAS = function (req, res) {
    res.render('./pdas/pdas', { title: 'PdAS' });
}

module.exports.DataAnalysis = function (req, res) {
    var period = parseInt(req.params.period);
    if(!period)
        period = 1;

    var now = getTimeStamp();
    var fromDate = new Date(now);
    var toDate = new Date(now);

    fromDate.setUTCDate(fromDate.getUTCDate() - (period - 1));
    fromDate.setUTCHours(0);
    fromDate.setUTCMinutes(0);
    fromDate.setUTCSeconds(0);
    fromDate.setUTCMilliseconds(0);

    pdasDBManager.getCurrentTrendData(fromDate, toDate, period, responseCurrentTrend);
    function responseCurrentTrend(err, datas) {
        if (err) {
            return res.status(500).send(err);
        }
        else {
            var resDataSets = {
                Machines: [],
                CurrentData : {
                    labels: [],
                    dataSets: []
                },
                PerformanceData : {},
                CycleTimeData : {}
            };
            var intervals = [];
            var machines = [];
            var motorInx = [];
            var tmpArr = [];
            datas.forEach(setLabels);
            function setLabels(element) {
                if (intervals.indexOf(element._id.timeKey.toUTCString()) < 0) {
                    intervals.push(element._id.timeKey.toUTCString());
                    resDataSets.CurrentData.labels.push((element._id.timeKey));
                    tmpArr.push(0);
                }
                if (machines.indexOf(element._id.MachineID) < 0) {
                    machines.push(element._id.MachineID);
                }
            }
            resDataSets.Machines = machines;
            var motors = ['DrivingMotor', 'HoistingMotor', 'ForkMotor']
            var inx = 0;
            for (var i in machines) {
                motorInx.push(inx);
                for (var cnt = 0; cnt < 3; cnt++) {
                    var dataset = new Object;
                    dataset.label = machines[i] + '_' + motors[cnt];
                    dataset.datas = tmpArr.slice(0);
                    resDataSets.CurrentData.dataSets.push(dataset);
                    inx++;
                }
            }
            for (var ipx in intervals) {
                datas.forEach(setDataSets);
                function setDataSets(element) {
                    if (intervals[ipx] != element._id.timeKey.toUTCString())
                        return;
                    var indx = ipx;
                    var mcInx = machines.indexOf(element._id.MachineID);
                    if (mcInx < 0)
                        return;
                    var subDatas = resDataSets.CurrentData.dataSets[motorInx[mcInx]].datas;
                    subDatas[ipx] = element.value.DrivingMotorCurrentAvg;
                    subDatas = resDataSets.CurrentData.dataSets[motorInx[mcInx]+1].datas;
                    subDatas[ipx] = element.value.HoistingMotorCurrentAvg;
                    subDatas = resDataSets.CurrentData.dataSets[motorInx[mcInx] + 2].datas;
                    subDatas[ipx] = element.value.ForkMotorCurrentAvg;
                }
            }
            return res.json(resDataSets);
        }
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

module.exports.CycleData = function (req, res) {
    res.render('./pdas/pdas', { title: 'Cycle Data' });
}

var randomScalingFactor = function () {
    return Math.round(Math.random() * (30 - 20) + 20);
};

var getTimeStamp = function (tmpDate) {
    var d;
    if (tmpDate)
        d = new Date(tmpDate);
    else
        d = new Date();

    var s =
        leadingZeros(d.getFullYear(), 4) + '-' +
        leadingZeros(d.getMonth() + 1, 2) + '-' +
        leadingZeros(d.getDate(), 2) + ' ' +

        leadingZeros(d.getHours(), 2) + ':' +
        leadingZeros(d.getMinutes(), 2) + ':' +
        leadingZeros(d.getSeconds(), 2) + ':' +
        leadingZeros(d.getMilliseconds(), 2) + 'Z';

    return s;
}

var leadingZeros = function (n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
}
