angular
    .module('wemsAnalysisPreviewApp', [])
    .controller('wemsAnalysisPreviewController', ['$scope', '$http', '$document', wemsAnalysisPreviewController]);

var wemsAnalysisPreviewVM;
var analysisDataForPreview;

var powerChart;
var cumulativeCycleTimeChart;
var powerEfficiencyBarChart;
var powerEfficiencyLineChart;

var currentAnalysisDataSet;
var analysisSummaryRows = 0;
var analysisSummaryDataList = [];
var currentFactor;
var currentAnalysisUnit;

var maxCol = 3;
function wemsAnalysisPreviewController($scope, $http, $document) {
    wemsAnalysisPreviewVM = this;

    wemsAnalysisPreviewVM.powerEfficiencyRows = [];
    wemsAnalysisPreviewVM.analysisDataRows = [];
    wemsAnalysisPreviewVM.analysisPeriod;
    wemsAnalysisPreviewVM.deviceInfoList = [];
    wemsAnalysisPreviewVM.selectedDeviceInfo;
    wemsAnalysisPreviewVM.selectedAnalysisUnit;
    wemsAnalysisPreviewVM.powerSummaryTitle;

    wemsAnalysisPreviewVM.onShowPrintPage = onShowPrintPageHandler;
    wemsAnalysisPreviewVM.onLoad = initializeAnalysisPreviewData;

    //////////////////////////////////////////////////////////////////////
    // On Print Page Handler
    function onShowPrintPageHandler() {
        window.print();
    }

    // Initialize Analysis Preview Data
    function initializeAnalysisPreviewData(initializeData) {
        var analysisDataForPreview = JSON.parse(initializeData);
        if (analysisDataForPreview) {
            currentFactor = analysisDataForPreview.currentFactor;
            currentAnalysisUnit = analysisDataForPreview.currentAnalysisUnit;
            wemsAnalysisPreviewVM.analysisPeriod = analysisDataForPreview.analysisPeriod;
            wemsAnalysisPreviewVM.selectedDeviceInfo = analysisDataForPreview.selectedDeviceInfo;
            analysisSummaryRows = analysisDataForPreview.analysisSummaryRows;
            currentAnalysisDataSet = analysisDataForPreview.currentAnalysisDataSet;
        }

        refreshPowerData(currentAnalysisDataSet);
        refreshCumulativeCycleTimeData(currentAnalysisDataSet);
        refreshPowerEfficiency(currentAnalysisDataSet);
        refreshAnalysisSummary(currentAnalysisDataSet);
    }

    // Refresh Power Data
    function refreshPowerData(analysisDataSet) {
        if (powerChart) {
            powerChart.destroy();
        }

        var ctx = document
            .getElementById('ID_WEMS_powerChart')
            .getContext('2d');

        var labels = getDateLabel(analysisDataSet);
        var datasets = getPowerDataSet(analysisDataSet);
        var powerData = {
            labels: labels,
            datasets: datasets
        };

        var titleName = '사용 전력량';
        var yAxesLabel = '( kW )';
        if (currentAnalysisUnit != "kW") {
            titleName = '사용 전력 비용';
            yAxesLabel = '( 1000 KRW )';
        }

        var options = {
            title: {
                display: true,
                text: titleName,
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
                    stacked: true,
                    gridLines: { display: false },
                    scaleLabel: {
                        display: true,
                        labelString: getXScaleLabelString(wemsAnalysisPreviewVM.selectedDateUnit)
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        callback: function (value) { return getNumberWithCommas(value); },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: yAxesLabel
                    }
                }],
            },
            legend: { display: true }
        };

        var config = {
            type: 'bar',
            data: powerData,
            options: options
        };

        powerChart = new Chart(ctx, config);
    }

    // Refresh Cumulative Cycle Time Data
    function refreshCumulativeCycleTimeData(analysisDataSet) {
        if (cumulativeCycleTimeChart) {
            cumulativeCycleTimeChart.destroy();
        }

        var ctx = document
            .getElementById('ID_WEMS_cycleTimeChart')
            .getContext('2d');

        var labels = getDateLabel(analysisDataSet);
        var datasets = getCumulativeCycleTimeDataSet(analysisDataSet);
        var powerData = {
            labels: labels,
            datasets: datasets
        };

        var options = {
            title: {
                display: true,
                text: '누적 사이클 타임',
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
                    stacked: true,
                    gridLines: { display: false },
                    scaleLabel: {
                        display: true,
                        labelString: getXScaleLabelString(wemsAnalysisPreviewVM.selectedDateUnit)
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        callback: function (value) { return getNumberWithCommas(value); },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '( sec )'
                    }
                }],
            },
            legend: { display: true }
        };

        var config = {
            type: 'bar',
            data: powerData,
            options: options
        };

        cumulativeCycleTimeChart = new Chart(ctx, config);
    }

    // Refresh Power Efficiency
    function refreshPowerEfficiency(analysisDataSet) {
        refreshPowerEfficiencyBarChart(analysisDataSet);
        refreshPowerEfficientyLineChart(analysisDataSet);
    }

    // Refresh Power Efficiency Bar Chart
    function refreshPowerEfficiencyBarChart(analysisDataSet) {
        if (powerEfficiencyBarChart) {
            powerEfficiencyBarChart.destroy();
        }

        var ctx = document
            .getElementById('ID_WEMS_powerEfficiencyBarContent')
            .getContext('2d');

        var labels = getDeviceLabel(analysisDataSet);
        var datasets = getPowerEfficiencyDataSetForDevice(analysisDataSet);
        var powerEfficiencyData = {
            labels: labels,
            datasets: datasets
        };

        var options = {
            title: {
                display: true,
                text: '전력량 효율(장비별)',
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

        powerEfficiencyBarChart = new Chart(ctx, config);
    }

    // Refresh Power Efficiency Line Chart
    function refreshPowerEfficientyLineChart(analysisDataSet) {
        if (powerEfficiencyLineChart) {
            powerEfficiencyLineChart.destroy();
        }

        var ctx = document
            .getElementById('ID_WEMS_powerEfficiencyLineChart')
            .getContext('2d');

        var labels = getDateLabel(analysisDataSet);
        var datasets = getPowerEfficiencyDataSetForDate(analysisDataSet);
        var powerEfficiencyData = {
            labels: labels,
            datasets: datasets
        };

        var options = {
            title: {
                display: true,
                text: '전력량 효율(시간별)',
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
                        labelString: getXScaleLabelString(wemsAnalysisPreviewVM.selectedDateUnit)
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
            legend: { display: true }
        };

        var config = {
            type: 'line',
            data: powerEfficiencyData,
            options: options
        };

        powerEfficiencyLineChart = new Chart(ctx, config);
    }

    // Refresh Analysis Summary
    function refreshAnalysisSummary(analysisDataSet) {
        analysisSummaryDataList = [];
        if (!analysisDataSet || !analysisDataSet.AnalysisData) {
            return;
        }

        wemsAnalysisPreviewVM.powerSummaryTitle = "사용 전력량(kW)";
        if (currentAnalysisUnit != "kW") {
            wemsAnalysisPreviewVM.powerSummaryTitle = "사용 전력 비용(1000 KRW)";
        }

        for (var dataIndex = 0; dataIndex < analysisDataSet.AnalysisData.length; dataIndex++) {
            if (!analysisDataSet.AnalysisData[dataIndex]) {
                continue;
            }

            var analaysisDataPerDate = analysisDataSet.AnalysisData[dataIndex].AnalysisDataPerDate;
            for (var analysisDataIndex = 0;
                analysisDataIndex < analaysisDataPerDate.length;
                analysisDataIndex++) {
                var analysisData = analaysisDataPerDate[analysisDataIndex];
                var analysisDate = getTimeStamp(analysisDataSet.AnalysisData[dataIndex].AnalysisDate);
                var deviceName = "S.C" + analysisData.MachineID;
                if (wemsAnalysisPreviewVM.selectedDeviceInfo &&
                    (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceID != 0) &&
                    (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceName != deviceName)) {
                    continue;
                }

                var calAnalysisData = analysisData.Power * currentFactor;
                analysisSummaryDataList.push({
                    "Date": analysisDate,
                    "DeviceName": deviceName,
                    "Power": getNumberWithCommas(calAnalysisData.toFixed(2)),
                    "CumulativeCycleTime": getNumberWithCommas(analysisData.CycleTime.toFixed(3)),
                    "PowerEfficiency": analysisData.PowerEfficiency
                });
            }
        }

        for (var analysisSummaryIndex = 0;
            analysisSummaryIndex < analysisSummaryRows;
            analysisSummaryIndex++) {
            wemsAnalysisPreviewVM.analysisDataRows.push(analysisSummaryDataList[analysisSummaryIndex]);
        }
    }

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
            dateLabels.push(getDateLabelFromDateUnit(analysisDate));
        }

        return dateLabels;
    }

    // Get DateLabel From Date Unit
    function getDateLabelFromDateUnit(analysisDate) {
        var dateLabelFromDateUnit;
        switch (wemsAnalysisPreviewVM.selectedDateUnit) {
            case "day":
                dateLabelFromDateUnit
                    = moment(analysisDate).format('HH');
                break;

            case "week":
            case "month":
                dateLabelFromDateUnit
                    = moment(analysisDate).format('YYYY/MM/DD');
                break;

            case "year":
                dateLabelFromDateUnit
                    = moment(analysisDate).format('YYYY/MM');
                break;

            default:
                dateLabelFromDateUnit
                    = moment(analysisDate).format('HH');
                break;
        }

        return dateLabelFromDateUnit;
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
            if (wemsAnalysisPreviewVM.selectedDeviceInfo &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceName != labelName)) {
                continue;
            }

            deviceLabelList.push(labelName);
        }

        return deviceLabelList;
    }

    // Get Power Data Set
    function getPowerDataSet(analysisDataSet) {
        if (!analysisDataSet) {
            return;
        }

        var powerDataSet = [];
        var lastYearData = [];
        for (deviceIndex = 0; deviceIndex < analysisDataSet.DeviceIDList.length; deviceIndex++) {
            var labelName = 'S.C' + analysisDataSet.DeviceIDList[deviceIndex].toString();
            if (wemsAnalysisPreviewVM.selectedDeviceInfo &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceName != labelName)) {
                continue;
            }

            var deviceData = [];
            for (dataIndex = 0; dataIndex < analysisDataSet.AnalysisData.length; dataIndex++) {
                var analysisData = analysisDataSet.AnalysisData[dataIndex];
                if (!analysisData) {
                    continue;
                }

                if (lastYearData.length - 1 < dataIndex) {
                    lastYearData.push(0);
                }

                var analysisDataPerDevice
                    = analysisData.AnalysisDataPerDate.filter(checkSameDevice, analysisDataSet.DeviceIDList[deviceIndex]);

                if (!analysisDataPerDevice
                    || analysisDataPerDevice.length == 0
                    || !analysisDataPerDevice[0]
                    || analysisDataPerDevice[0].Power < 0) {
                    deviceData.push(0);
                    continue;
                }

                var calAnalysisData = analysisDataPerDevice[0].Power * currentFactor;
                if (currentAnalysisUnit != "kW") {
                    calAnalysisData = Number(calAnalysisData.toFixed(2));
                }

                deviceData.push(calAnalysisData);
                lastYearData[dataIndex] += calAnalysisData;
            }

            var randomBackGroundColor = generateRandomRGBA();
            var powerDataSetPerDevice = {
                label: labelName,
                data: deviceData,
                backgroundColor: randomBackGroundColor,
                hoverBackgroundColor: randomBackGroundColor,
                hoverBorderWidth: 2,
                hoverBorderColor: 'lightgrey'
            }

            powerDataSet.push(powerDataSetPerDevice);
        }

        var lastYearPowerDataSet = {
            label: '작년',
            type: 'line',  // override the default type
            fill: false,
            backgroundColor: "black",
            borderColor: "black",
            data: lastYearData,
            options: {
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                    }
                }
            }
        }

        powerDataSet.push(lastYearPowerDataSet);

        return powerDataSet;
    }

    // Get Cumulative Cycle Time Data Set
    function getCumulativeCycleTimeDataSet(analysisDataSet) {
        if (!analysisDataSet) {
            return;
        }

        var cumulativeCycleTimeDataSet = [];
        var lastYearData = [];
        for (deviceIndex = 0; deviceIndex < analysisDataSet.DeviceIDList.length; deviceIndex++) {
            var labelName = 'S.C' + analysisDataSet.DeviceIDList[deviceIndex].toString();
            if (wemsAnalysisPreviewVM.selectedDeviceInfo &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceName != labelName)) {
                continue;
            }

            var deviceData = [];
            for (dataIndex = 0; dataIndex < analysisDataSet.AnalysisData.length; dataIndex++) {
                var analysisData = analysisDataSet.AnalysisData[dataIndex];
                if (!analysisData) {
                    continue;
                }

                if (lastYearData.length - 1 < dataIndex) {
                    lastYearData.push(0);
                }

                var analysisDataPerDevice
                    = analysisData.AnalysisDataPerDate.filter(checkSameDevice, analysisDataSet.DeviceIDList[deviceIndex]);

                if (!analysisDataPerDevice
                    || analysisDataPerDevice.length == 0
                    || !analysisDataPerDevice[0]
                    || analysisDataPerDevice[0].CycleTime < 0) {
                    deviceData.push(0);
                    continue;
                }

                deviceData.push(analysisDataPerDevice[0].CycleTime.toFixed(3));
                lastYearData[dataIndex] += analysisDataPerDevice[0].CycleTime.toFixed(3);
            }

            var randomBackGroundColor = generateRandomRGBA();
            var cumulativeCycleTimeDataSetPerDevice = {
                label: labelName,
                data: deviceData,
                backgroundColor: randomBackGroundColor,
                hoverBackgroundColor: randomBackGroundColor,
                hoverBorderWidth: 2,
                hoverBorderColor: 'lightgrey'
            }

            cumulativeCycleTimeDataSet.push(cumulativeCycleTimeDataSetPerDevice);
        }

        var lastYearPowerDataSet = {
            label: '작년',
            type: 'line',  // override the default type
            fill: false,
            backgroundColor: "black",
            borderColor: "black",
            data: lastYearData,
            options: {
                elements: {
                    line: {
                        tension: 0, // disables bezier curves
                    }
                }
            }
        }

        cumulativeCycleTimeDataSet.push(lastYearPowerDataSet);

        return cumulativeCycleTimeDataSet;
    }

    // Get Get Power Efficiency Data Set
    function getPowerEfficiencyDataSetForDate(analysisDataSet) {
        if (!analysisDataSet) {
            return;
        }

        var powerEfficiencyDataSet = [];
        for (deviceIndex = 0; deviceIndex < analysisDataSet.DeviceIDList.length; deviceIndex++) {
            var labelName = 'S.C' + analysisDataSet.DeviceIDList[deviceIndex].toString();
            if (wemsAnalysisPreviewVM.selectedDeviceInfo &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceName != labelName)) {
                continue;
            }

            var deviceData = [];
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
                    deviceData.push(0);

                    continue;
                }

                deviceData.push(analysisDataPerDevice[0].PowerEfficiency);
            }

            var randomBackGroundColor = generateRandomRGBA();
            var powerEfficiencyDataSetPerDevice = {
                label: labelName,
                data: deviceData,
                fill: false,
                borderColor: randomBackGroundColor,
                backgroundColor: randomBackGroundColor,
                hoverBackgroundColor: randomBackGroundColor,
                hoverBorderWidth: 2,
                hoverBorderColor: 'lightgrey'
            }

            powerEfficiencyDataSet.push(powerEfficiencyDataSetPerDevice);
        }

        return powerEfficiencyDataSet;
    }

    // Get Get Power Efficiency Data Set
    function getPowerEfficiencyDataSetForDevice(analysisDataSet) {
        if (!analysisDataSet) {
            return;
        }

        wemsAnalysisPreviewVM.powerEfficiencyRows = [];
        var powerEfficiencyData = [];
        var backGroundColor = [];
        var powerEfficiencies = [];
        for (deviceIndex = 0; deviceIndex < analysisDataSet.DeviceIDList.length; deviceIndex++) {
            var deviceName = "S.C" + analysisDataSet.DeviceIDList[deviceIndex];
            if (wemsAnalysisPreviewVM.selectedDeviceInfo &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisPreviewVM.selectedDeviceInfo.DeviceName != deviceName)) {
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
                wemsAnalysisPreviewVM.powerEfficiencyRows.push(powerEfficiencies);
                powerEfficiencies = [];
            }

            backGroundColor.push(generateRandomRGBA());
        }

        wemsAnalysisPreviewVM.powerEfficiencyRows.push(powerEfficiencies);

        var powerEfficiencyDataSet = [{
            data: powerEfficiencyData,
            label: "Power Efficiency",
            backgroundColor: backGroundColor,
            hoverBorderWidth: 2,
            hoverBorderColor: 'lightgrey'
        }]

        return powerEfficiencyDataSet;
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

    // Check Same Device
    function checkSameDevice(data) {
        return data.MachineID == this;
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

    // Get X Scale Label String
    function getXScaleLabelString(selectedDateUnit) {
        var xScaleLabelString = '( hr )';
        switch (selectedDateUnit) {
            case "day":
                xScaleLabelString = '( hr )';
                break;

            case "week":
            case "month":
                xScaleLabelString = '( day )';
                break;

            case "year":
                xScaleLabelString = '( month )';
                break;

            default:
                xScaleLabelString = '( hr )';
                break;
        }

        return xScaleLabelString;
    }
}


