﻿/* WEMS Javascript */
var powerEfficiencyPerDeviceChart;
var powerEfficiencyPerDateChart;
var standardPower;
var refreshIntervalId;
var tempRGBColor = ["rgba(255, 0, 0, 0.7)", "rgba(0, 255, 0, 0.7)", "rgba(0, 0, 255, 0.7)", "rgba(255, 255, 0, 0.7)",
    "rgba(255, 0, 255, 0.7)", "rgba(255, 255, 0, 0.7)", "rgba(0, 255, 255, 0.7)", "rgba(255, 64, 0, 0.7)",
    "rgba(255, 0, 64, 0.7)", "rgba(64, 255, 0, 0.7)", "rgba(64, 0, 255, 0.7)", "rgba(0, 255, 64, 0.7)",
    "rgba(0, 64, 255, 0.7)", "rgba(255, 255, 64, 0.7)", "rgba(255, 64, 255, 0.7)", "rgba(64, 255, 255, 0.7)",
    "rgba(255, 128, 0, 0.7)", "rgba(255, 0, 128, 0.7)", "rgba(128, 255, 0, 0.7)", "rgba(128, 0, 255, 0.7)"];

// Initialzie Monitoring Data
function initializeMonitoringData() {
    refreshIntervalId
        = setInterval(refreshMonitoringData, 5000);
    /// clearInterval(refreshIntervalId);
}

// Refresh WEMS Monitoring Data
function refreshMonitoringData() {
    var startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    var endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    getAnalysisData()
        .then(function (res, status, headers, config) {
            calPowerEfficiencyData(res.data.AnalysisData);

            refreshPowerEfficiencyPerDevice(res.data);
            refreshPowerEfficiencyPerDate(res.data);
        })
        .catch(function (e) {
            var newMessage = 'XHR Failed for getPowerData'
            if (e.data && e.data.description) {
                newMessage = newMessage + '\n' + e.data.description;
            }

            e.data.description = newMessage;
        });
}

// Refresh Power Efficiency Bar Chart
function refreshPowerEfficiencyPerDevice(analysisDataSet) {


    var labels = getDeviceLabel(analysisDataSet);
    var datasets = getPowerEfficiencyDataSetForDevice(analysisDataSet);
    var powerEfficiencyData = {
        labels: labels,
        datasets: datasets
    };

    if (!powerEfficiencyPerDeviceChart) {
        var ctx = document
            .getElementById('ID_WEMS_powerEfficiencyPerDevice')
            .getContext('2d');

        var options = {
            title: {
                display: true,
                text: '오늘의 장비별 전력량 효율',
                position: 'top',
                fontSize: 14
            },
            animation: {
                duration: 10,
            },
            tooltips: {
                mode: 'label',
                callbacks: {
                    label: function (tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ": " + getNumberWithCommas(tooltipItem.yLabel);
                    }
                }
            },
            scales: {
                xAxes: [{
                    gridLines: { display: false },
                    scaleLabel: {
                        display: true,
                        labelString: '( Device )'
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: function (value) { return getNumberWithCommas(value); },
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '( % )'
                    }
                }],
            },
            legend: { display: false }
        };

        var config = {
            type: 'bar',
            data: powerEfficiencyData,
            options: options
        };

        powerEfficiencyPerDeviceChart = new Chart(ctx, config);
    }

    powerEfficiencyPerDeviceChart.data = powerEfficiencyData;
    powerEfficiencyPerDeviceChart.update();
}

// Refresh Power Efficiency Date Chart
function refreshPowerEfficiencyPerDate(analysisDataSet) {
    var labels = getDateLabel(analysisDataSet);
    var datasets = getPowerEfficiencyDataSetForDate(analysisDataSet);
    var powerEfficiencyData = {
        labels: labels,
        datasets: datasets
    };

    if (!powerEfficiencyPerDateChart) {
        var ctx = document
            .getElementById('ID_WEMS_powerEfficiencyPerDate')
            .getContext('2d');

        var options = {
            title: {
                display: true,
                text: '오늘의 시간대별 전력량 효율',
                position: 'top',
                fontSize: 14
            },
            animation: {
                duration: 10,
            },
            tooltips: {
                mode: 'label',
                callbacks: {
                    label: function (tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ": " + getNumberWithCommas(tooltipItem.yLabel);
                    }
                }
            },
            scales: {
                xAxes: [{
                    gridLines: { display: false },
                    scaleLabel: {
                        display: true,
                        labelString: '( hr )'
                    }
                }],
                yAxes: [{
                    ticks: {
                        callback: function (value) { return getNumberWithCommas(value); },
                        beginAtZero: true
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '( % )'
                    }
                }],
            },
            legend: { display: false }
        };

        var config = {
            type: 'bar',
            data: powerEfficiencyData,
            options: options
        };

        powerEfficiencyPerDateChart = new Chart(ctx, config);
    }

    powerEfficiencyPerDateChart.data = powerEfficiencyData;
    powerEfficiencyPerDateChart.update();
}

// Get Analysis Data
function getAnalysisData(period) {
    var config = {
        params: period,
        headers: { 'Authorization': 'Basic YmVlcDpib29w' }
    }

    return $http.get('/wems/getAnalysisData/', config);
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

// Get Device Label
function getDeviceLabel(analysisDataSet) {
    if (!analysisDataSet) {
        return;
    }

    var deviceLabelList = [];
    for (var deviceIndex = 0;
        deviceIndex < analysisDataSet.DeviceIDList.length;
        deviceIndex++) {
        var labelName = 'S.C' + analysisDataSet.DeviceIDList[deviceIndex];
        if (dashVM.selectedDeviceInfo &&
            (dashVM.selectedDeviceInfo.DeviceID != 0) &&
            (dashVM.selectedDeviceInfo.DeviceName != labelName)) {
            continue;
        }

        deviceLabelList.push(labelName);
    }

    return deviceLabelList;
}

// Get Get Power Efficiency Data Set
function getPowerEfficiencyDataSetForDate(analysisDataSet) {
    if (!analysisDataSet || !analysisDataSet.AnalysisData) {
        return;
    }

    var powerEfficiencyDataSet = [];
    var powerEfficiencyData = [];
    for (dataIndex = 0; dataIndex < analysisDataSet.AnalysisData.length; dataIndex++) {
        var analysisData = analysisDataSet.AnalysisData[dataIndex];
        if (!analysisData || !analysisData.AnalysisDataPerDate) {
            continue;
        }

        var powerEfficiencyAverage = 0;
        for (dataPerDateIndex = 0; dataPerDateIndex < analysisData.AnalysisDataPerDate.length; dataPerDateIndex++) {
            powerEfficiencyAverage
                += analysisData.AnalysisDataPerDate[dataPerDateIndex].PowerEfficiency;
        }

        powerEfficiencyAverage = Number(powerEfficiencyAverage / analysisDataSet.DeviceIDList.length).toFixed(2); 
        powerEfficiencyData.push(powerEfficiencyAverage);
    }

    var powerEfficiencyDataSet = [{
        data: powerEfficiencyData,
        label: "Power Efficiency",
        backgroundColor: "rgba(0, 0, 255, 0.7)",
        hoverBorderWidth: 2,
        hoverBorderColor: 'lightgrey'
    }]

    return powerEfficiencyDataSet;
}

// Get Get Power Efficiency Data Set
function getPowerEfficiencyDataSetForDevice(analysisDataSet) {
    if (!analysisDataSet) {
        return;
    }

    var powerEfficiencyData = [];
    var backGroundColorList = [];
    var powerEfficiencies = [];
    for (deviceIndex = 0; deviceIndex < analysisDataSet.DeviceIDList.length; deviceIndex++) {
        var deviceName = "S.C" + analysisDataSet.DeviceIDList[deviceIndex];
        if (dashVM.selectedDeviceInfo &&
            (dashVM.selectedDeviceInfo.DeviceID != 0) &&
            (dashVM.selectedDeviceInfo.DeviceName != deviceName)) {
            continue;
        }

        var totalEfficiencyPerDevice = 0;
        for (dataIndex = 0; dataIndex < analysisDataSet.AnalysisData.length; dataIndex++) {
            var analysisData = analysisDataSet.AnalysisData[dataIndex];
            if (!analysisData) {
                continue;
            }

            var analysisDataPerDevice
                = analysisData.AnalysisDataPerDate.filter(checkSameDevice, analysisDataSet.DeviceIDList[deviceIndex]);

            if (!analysisDataPerDevice
                || analysisDataPerDevice.length == 0
                || !analysisDataPerDevice[0]
                || analysisDataPerDevice[0].PowerEfficiency < 0) {
                continue;
            }

            totalEfficiencyPerDevice += analysisDataPerDevice[0].PowerEfficiency;
        }

        var powerEfficiency = Number((totalEfficiencyPerDevice
            / analysisDataSet.AnalysisData.length).toFixed(2));
        if (!powerEfficiency) {
            powerEfficiency = 0;
        }

        powerEfficiencyData.push(powerEfficiency);
        powerEfficiencies.push({
            "DeviceHeader": "장비",
            "PowerEfficiencyHeader": "전력량 효율(%)",
            "Device": deviceName,
            "PowerEfficiency": powerEfficiency,
        });

        if ((deviceIndex + 1) % maxCol == 0) {
            powerEfficiencies = [];
        }

        var backGroundColor = generateRandomRGBA(0);
        if (tempRGBColor.length > deviceIndex) {
            backGroundColor = tempRGBColor[deviceIndex];
        }

        backGroundColorList.push(backGroundColor);
    }

    var powerEfficiencyDataSet = [{
        data: powerEfficiencyData,
        label: "Power Efficiency",
        backgroundColor: backGroundColorList,
        hoverBorderWidth: 2,
        hoverBorderColor: 'lightgrey'
    }]

    return powerEfficiencyDataSet;
}

// Initialzie Management Data
function initializeManagementData() {
    getManagementData()
        .then(function (res, status, headers, config) {
            standardPower = res.data.StandardPower;
            initializeMonitoringData();
        })
        .catch(function (e) {
            var newMessage = 'XHR Failed for getPowerData'
            if (e.data && e.data.description) {
                newMessage = newMessage + '\n' + e.data.description;
            }

            e.data.description = newMessage;
            /// logger.error(newMessage);
        });
}

// Get Management Data
function getManagementData() {
    return $http.get('/wems/getManagementData/');
}

// Change Date Format
function getTimeStamp(date) {
    var analysisDate = new Date(date);
    var stamp =
        leadingZeros(analysisDate.getFullYear(), 4) + '-' +
        leadingZeros(analysisDate.getMonth() + 1, 2) + '-' +
        leadingZeros(analysisDate.getDate(), 2) + ' ' +

        leadingZeros(analysisDate.getHours(), 2) + ':' +
        leadingZeros(analysisDate.getMinutes(), 2) + ':' +
        leadingZeros(analysisDate.getSeconds(), 2);

    return stamp;
}

// Check Same Device
function checkSameDevice(data) {
    return data.MachineID == this;
}

// Leading Zeros
function leadingZeros(number, digits) {
    var zero = '';
    number = number.toString();

    if (number.length < digits) {
        for (i = 0; i < digits - number.length; i++)
            zero += '0';
    }
    return zero + number;
}

// Getnerate Random RGBA
function generateRandomRGBA() {
    var r = getRandomInteger(0, 255).toString();
    var g = getRandomInteger(0, 255).toString();
    var b = getRandomInteger(0, 255).toString();
    var a = "0.7"

    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

// Get Random Integer
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 

// Get Number With Commas
function getNumberWithCommas(item) {
    return item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Get Date Label
function getDateLabel(analysisDataSet) {
    if (!analysisDataSet) {
        return;
    }

    var dateLabels = [];
    for (index = 0; index < analysisDataSet.AnalysisData.length; index++) {
        var analysisDate = new Date(analysisDataSet.AnalysisData[index].AnalysisDate);
        dateLabels.push(analysisDate.getHours().toString());
    }

    return dateLabels;
}

/* OnLoad() call from index */
function wems_OnLoad() {
    initializeManagementData();
}
