/* Machine Agent Restful API Handler */
var machineDBManager = require('../utility/dbManager/machineDBManager.js');

module.exports.updateMachineConfig = function (req, res) {
    var machineInfo = JSON.parse(JSON.stringify(req.body));

    machineDBManager.addMachineInfo(machineInfo, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.addMachineRealTimeData = function (req, res) {
    var machineRealTimeData = JSON.parse(JSON.stringify(req.body));

    machineDBManager.addMachineRealTimeData(machineRealTimeData, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.addMachineCycleData = function (req, res) {
    var machineCycleData = JSON.parse(JSON.stringify(req.body));

    machineDBManager.addMachineCycleData(machineCycleData, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
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