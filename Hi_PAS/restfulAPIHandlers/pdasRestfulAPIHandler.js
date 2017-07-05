/* PdAS Restful API Handler */
var dbManager = require('../utility/dbManager/commonDBManager');
var pdasDBManager = require('../utility/dbManager/pdasDBManager');

module.exports.PdAS = function (req, res) {
    res.render('./pdas/pdas', { title: 'PdAS' });
}

module.exports.DataAnalysis = function (req, res) {
    var period = req.body.period;
    period = 1;
    var now = getTimeStamp();
    var fromDate = new Date(now);
    var toDate   = new Date(now);
    var interval = 0;

    fromDate.setUTCDate(fromDate.getUTCDate() - (period - 1));
    fromDate.setUTCHours(0);
    fromDate.setUTCMinutes(0);
    fromDate.setUTCSeconds(0);
    fromDate.setUTCMilliseconds(0);

    switch (period) {
        case 1: interval = period * 900000; break;  // 당일 선택시 15분단위로 Data get
        case 7: interval = period * 3600000; break;  // 일주일 선택시 6시간 단위로 
        case 30:
        case 90:  interval = period * 3600000; break;  // 한달/3달 선택시 6시간 단위로
        case 365: interval = period * 86400000; break;  // 1년 선택시 하루 단위로
        default: interval = period * 600000;
    }

    //pdasDBManager.FindCurrentData(fromDate, toDate, period, setResponseData);

    function setResponseData(err, datas) {
        if (err) {
            //console.log(err.message);
            //res.status(500).send('Data find failure');
        }
        else {

        }
    }
    //console.log(responseData);
    //res.json(responseData);
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
