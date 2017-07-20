// WEMS Restful API Handler
var wemsDBManager = require('../utility/dbManager/wemsDBManager');
var machineAnalysisData = require('../models/wems/machineAnalysisData.json');

// GET Restful API Handler
/* XXX Must Fix Standard Power Data */
var standardPower = 600000;
var analysisPreviewData;
module.exports.getAnalysisData = function (req, res) {
    if (!wemsDBManager) {
        return;
    }

    var startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    var endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    var period = {
        dateUnit: "day",
        startDate: startDate,
        endDate: endDate
    }

    if (req.query.startDate && req.query.endDate) {
        period.dateUnit = req.query.dateUnit;
        period.startDate = new Date(+req.query.startDate);
        period.endDate = new Date(+req.query.endDate);
    }

    console.log("===========================");
    console.log(period.startDate);
    console.log(period.endDate);
    console.log("===========================");

    /* XXX Must Get DeviceID From DB */
    var deviceIDList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    var machineCycleDataPerDeviceList = [];
    deviceIDList.forEach(generateDeviceMachineCycleDataHandler);

    function generateDeviceMachineCycleDataHandler(deviceID) {
        wemsDBManager.getMachineCycleData(period, deviceID, function (err, machineCycleDataList) {
            if (err) {
                res.status(505).json({ error: err });
                return;
            }

            machineCycleDataPerDeviceList.push({
                DeviceID: deviceID,
                DeviceMachineCycleData: machineCycleDataList
            });

            if (machineCycleDataPerDeviceList.length == deviceIDList.length) {
                machineCycleDataPerDeviceList.sort(function (a, b) {
                    return a.DeviceID - b.DeviceID;
                });

                var analysisData = generateAnalysisData(machineCycleDataPerDeviceList, period.dateUnit);
                var anlysisDataSet = JSON.stringify({
                    "DeviceIDList": deviceIDList,
                    "AnalysisData": analysisData
                });

                res.send(anlysisDataSet);
            }
        });
    }
}

module.exports.getManagementData = function (req, res) {
    wemsDBManager.getManagementData(function (err, result) {
        if (err) {
            res.status(505).json({ error: err });
            return;
        }

        var managementData = JSON.stringify({
            "Threshold1": result.Threshold1,
            "Threshold2": result.Threshold2,
            "StandardPower": result.StandardPower,
            "Cost": result.Cost
        });

        res.send(managementData);
    });
}

module.exports.updateAnalysisPreviewData = function (req, res) {
    analysisPreviewData = {
        analysisPreviewData: JSON.stringify(req.body)
    };

    res.end();
}

module.exports.getAnalysisPreview = function (req, res) {
    res.render('./wems/wems_popup_analysis_print', analysisPreviewData);
}

// POST Restful API Handler
// PUT Restful API Handler
module.exports.updateManagementData = function (req, res) {
    var param = {
        'Threshold1': req.body.Threshold1,
        'Threshold2': req.body.Threshold2,
        'StandardPower': req.body.StandardPower,
        'Cost': req.body.Cost
    };

    wemsDBManager.updateManagementData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

// DELETE Restful API Handler

// WEMS Method
function generateAnalysisData(machineCycleDataPerDeviceList, dateUnit) {
    var analysisDataList = [];
    machineCycleDataPerDeviceList.forEach(generateAnalysisDataHandler);
    calPowerEfficiencyData(analysisDataList);

    return analysisDataList;

    ////////////////////////////////////////////////////
    // generateAnalysisData Handler
    function generateAnalysisDataHandler(machineCycleDataPerDevice) {
        if (!machineCycleDataPerDevice) {
            return;
        }

        if (machineCycleDataPerDevice.DeviceMachineCycleData.length == 0) {
            return;
        }

        machineCycleDataPerDevice.DeviceMachineCycleData.forEach(generateAnalysisDataPerDeviceHandler)

        //////////////////////////////////////////////////
        // generateAnalysisDataPerDevice Handler
        var preMachineCycleData;
        function generateAnalysisDataPerDeviceHandler(machineCycleData) {
            if (!machineCycleData) {
                return;
            }

            var powerPerCycle = calPowerDataPerCycle(preMachineCycleData, machineCycleData);
            preMachineCycleData = machineCycleData;
            if (powerPerCycle == 0) {
                return;
            }

            var cycleTime = calCycleTimeData(machineCycleData);
            var analysisStartDate = getAnalysisStartDate(machineCycleData, dateUnit);
            for (index = 0; index < analysisDataList.length; index++) {
                if (analysisDataList[index].AnalysisDate.getTime() === analysisStartDate.getTime()) {
                    // 해당 날짜의 정보가 있는 경우
                    for (deviceIndex = 0;
                        deviceIndex < analysisDataList[index].AnalysisDataPerDate.length;
                        deviceIndex++) {
                        // 해당 날짜 해당 Device의 정보가 있는 경우
                        if (analysisDataList[index].AnalysisDataPerDate[deviceIndex].MachineID
                            == machineCycleData.MachineID) {
                            analysisDataList[index].AnalysisDataPerDate[deviceIndex].Power
                                += powerPerCycle;
                            analysisDataList[index].AnalysisDataPerDate[deviceIndex].CycleTime
                                += cycleTime;

                            return;
                        }
                    }

                    // 해당 날짜의 정보 중 해당 Device의 정보가 없는 경우
                    analysisDataList[index].AnalysisDataPerDate.push({
                        MachineID: machineCycleData.MachineID,
                        Power: powerPerCycle,
                        CycleTime: cycleTime,
                        PowerEfficiency: 0
                    });

                    return;
                }
            }

            // 해당 날짜의 정보가 없는 경우
            var analysisDate = JSON.parse(JSON.stringify(machineAnalysisData));
            analysisDate.AnalysisDate = analysisStartDate;
            analysisDate.AnalysisDataPerDate = [{
                MachineID: machineCycleData.MachineID,
                Power: powerPerCycle,
                CycleTime: cycleTime,
                PowerEfficiency: 0
            }];

            analysisDataList.push(analysisDate);
        }
    }
} 

// Get Analysis Start Date
function getAnalysisStartDate(machineCycleData, dateUnit) {
    if (!machineCycleData) {
        return;
    }

    var analysisStartDate;
    switch (dateUnit) {
        case "day":
            analysisStartDate
                = new Date(machineCycleData.TotalStartTime.setMinutes(0, 0, 0));
            break;

        case "week":
            analysisStartDate
                = new Date(machineCycleData.TotalStartTime.setHours(0, 0, 0, 0));
            break;

        case "month":
            analysisStartDate
                = new Date(machineCycleData.TotalStartTime.setHours(0, 0, 0, 0));
            break;

        case "year":
            var firstDatePerMonth = new Date(machineCycleData.TotalStartTime.setDate(1));
            analysisStartDate
                = new Date(firstDatePerMonth.setHours(0, 0, 0, 0));
            break;

        default:
            analysisStartDate
                = new Date(machineCycleData.TotalStartTime.setMinutes(0, 0, 0));
            break;
    }

    return analysisStartDate;
}

// Cal Power Data Per Cycle
function calPowerDataPerCycle(preMachineCycleData, machineCycleData) {
    if (!preMachineCycleData) {
        return 0;
    }

    var preDrivingInfoLength = preMachineCycleData.DrivingInfo.length;
    var preHoistingInfoLength = preMachineCycleData.HoistingInfo.length;
    var preForkInfoLength = preMachineCycleData.ForkInfo.length;
    var drivingInfoLength = machineCycleData.DrivingInfo.length;
    var hoistingInfoLength = machineCycleData.HoistingInfo.length;
    var forkInfoLength = machineCycleData.ForkInfo.length;

    var preDrivingInfoMotorPowerConsumption = 0;
    var preHoistingInfoMotorPowerConsumption = 0;
    var preForkInfoMotorPowerConsumption = 0;
    if (preDrivingInfoLength > 0) {
        preDrivingInfoMotorPowerConsumption
            = preMachineCycleData.DrivingInfo[preDrivingInfoLength - 1].MotorPowerConsumption;
    }

    if (preHoistingInfoLength > 0) {
        preHoistingInfoMotorPowerConsumption
            = preMachineCycleData.HoistingInfo[preHoistingInfoLength - 1].MotorPowerConsumption;
    }

    if (preForkInfoLength > 0) {
        preForkInfoMotorPowerConsumption
            = preMachineCycleData.ForkInfo[preForkInfoLength - 1].MotorPowerConsumption;
    }

    var powerPerCycle = 0;
    if (drivingInfoLength > 0) {
        powerPerCycle = powerPerCycle
            + (machineCycleData.DrivingInfo[drivingInfoLength - 1].MotorPowerConsumption
                - preDrivingInfoMotorPowerConsumption);
    }

    if (hoistingInfoLength > 0) {
        powerPerCycle = powerPerCycle
            + (machineCycleData.HoistingInfo[hoistingInfoLength - 1].MotorPowerConsumption
                - preHoistingInfoMotorPowerConsumption);
    }

    if (forkInfoLength > 0) {
        powerPerCycle = powerPerCycle
            + (machineCycleData.ForkInfo[forkInfoLength - 1].MotorPowerConsumption
                - preForkInfoMotorPowerConsumption);
    }


    return powerPerCycle;
}

// Cal Cycle Time Data 
function calCycleTimeData(machineCycleData) {
    return (machineCycleData.TotalEndTime - machineCycleData.TotalStartTime) / 1000;
}

// Cal Power Efficiency 
function calPowerEfficiencyData(analysisDataList) {
    if (!analysisDataList) {
        return analysisDataList;
    }

    for (var analysisDataIndex = 0;
        analysisDataIndex < analysisDataList.length;
        analysisDataIndex++) {
        if (!analysisDataList[analysisDataIndex] || !analysisDataList[analysisDataIndex].AnalysisDataPerDate) {
            continue;
        }

        for (var analysisDataPerDateIndex = 0;
            analysisDataPerDateIndex < analysisDataList[analysisDataIndex].AnalysisDataPerDate.length;
            analysisDataPerDateIndex++) {
            var analysisDataPerDate
                = analysisDataList[analysisDataIndex].AnalysisDataPerDate[analysisDataPerDateIndex];
            if (!analysisDataPerDate) {
                continue;
            }

            analysisDataPerDate.PowerEfficiency
                = calPowerEfficiencyDataPerDate(analysisDataPerDate.Power, analysisDataPerDate.CycleTime);
        }
    }

    return analysisDataList;
}

// Cal Power Efficiency Per Date
function calPowerEfficiencyDataPerDate(power, cycleTime) {
    if (!standardPower || (standardPower == 0)) {
        return 0;
    }

    var hours = cycleTime / 3600;
    return Number((((power / hours.toFixed(3)) / standardPower) * 100).toFixed(2));
}

