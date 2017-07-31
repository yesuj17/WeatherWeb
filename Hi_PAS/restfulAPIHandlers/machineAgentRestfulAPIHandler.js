/* Machine Agent Restful API Handler */
var machineDBManager = require('../utility/dbManager/machineDBManager.js');
var pdasDBManager = require('../utility/dbManager/pdasDBManager');

module.exports.updateMachineConfig = function (req, res) {
    var machineInfo = JSON.parse(JSON.stringify(req.body));

    machineDBManager.addMachineInfo(machineInfo, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: "Invalid Operation" });
        }
    });
}

module.exports.addMachineRealTimeData = function (req, res) {
    var machineRealTimeData = JSON.parse(JSON.stringify(req.body));
    machineDBManager.addMachineRealTimeData(machineRealTimeData, function (result) {
        if (result == true) {
            var motorType = ['DrivingMotor', 'HoistingMortor', 'ForkMotor'];
            var currentAvg = {
                MachineID: machineRealTimeData.MachineID,
                Type: '',
                CurrentVal: 0
            };
            var drivingTotalCnt = 0;
            var hoistingTotalCnt = 0;
            var ForkTotalCnt = 0;
            var arrAvg = [0, 0, 0];
            machineRealTimeData.MotorInfos.forEach(function (data) {
                if (data.DrivingCurrent > 0) {
                    drivingTotalCnt++;
                    arrAvg[0] += data.DrivingCurrent;
                }
                if (data.HoistingCurrent > 0) {
                    hoistingTotalCnt++;
                    arrAvg[1] += data.HoistingCurrent;
                }
                if (data.ForkCurrent > 0) {
                    ForkTotalCnt++;
                    arrAvg[2] += data.ForkCurrent;
                }
            });
            if (drivingTotalCnt > 0)
                arrAvg[0] /= drivingTotalCnt;
            if (hoistingTotalCnt > 0)
                arrAvg[1] /= hoistingTotalCnt;
            if (ForkTotalCnt > 0)
                arrAvg[2] /= ForkTotalCnt;

            var arrCurrentAvg = [];
            for (var ipx in motorType) {
                var currentAvg = new Object();
                currentAvg.MachineID = machineRealTimeData.MachineID;
                currentAvg.Type = motorType[ipx];
                currentAvg.CurrentVal = arrAvg[ipx] * 0.001;
                arrCurrentAvg.push(currentAvg);
            }

            global.socketIo.sockets.emit('updateCurrentData', arrCurrentAvg);         

            res.end();
        }
        else {
            res.status(505).json({ error: "Invalid Operation" });
        }
    });
}

module.exports.addMachineCycleData = function (req, res) {
    var machineCycleData = JSON.parse(JSON.stringify(req.body));

    machineDBManager.addMachineCycleData(machineCycleData, function (result) {
        if (result == true) {
            var fromDate = new Date();
            var toDate = new Date();
            var period = Math.floor((toDate - fromDate) / 1000 / 60 / 60 / 24);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);

            pdasDBManager.getPerformanceSummaryData(fromDate, toDate, 0, function (err, datas) {
                if (err) {
                    res.status(500).send('error: Data base access failure.');
                }
                var OEESummary = {
                    OEE: '',
                    IStockRate: '',
                    BalancingRate: '',
                    Yield: ''
                }
                var oeeRawData = datas[0].slice(0);
                var errData = datas[1].slice(0);
                var totalIStockRate = 0;
                var totalBalancingRate = 0;
                var totalYield = 0;
                for (var ipx in oeeRawData) {
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
                }
                OEESummary.IStockRate = (totalIStockRate / oeeRawData.length);
                if (OEESummary.IStockRate > 1)
                    OEESummary.IStockRate = 1;
                OEESummary.BalancingRate = (totalBalancingRate / oeeRawData.length);
                OEESummary.Yield = (totalYield / oeeRawData.length);
                OEESummary.OEE = (OEESummary.BalancingRate * OEESummary.Yield);
                global.socketIo.sockets.emit('updateOEESummaryData', OEESummary);
                res.end();
            });
        }
        else {
            res.status(505).json({ error: "Invalid Operation" });
        }
    });
}

module.exports.addMachineErrorData = function (req, res) {
    var machineErrorData = JSON.parse(JSON.stringify(req.body));

    machineDBManager.addMachineErrorData(machineErrorData, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });    
}