angular
    .module('wemsAnalysisPreviewApp', [])
    .controller('wemsAnalysisPreviewController', ['$scope', '$http', wemsAnalysisPreviewController]);

var powerChart;
var cumulativeCycleTimeChart;
var powerEfficiencyBarChart;
var powerEfficiencyLineChart;
var currentAnalysisDataSet;
var analysisSummaryDataList = [];
/* XXX Must Get From DB */
var costPerkW = 0.3;
var currentFactor = 1;

/* XXX Max Summary Column Number */
var maxCol = 8;
var analysisSummaryRowCount = 50;
var analysisSummaryPageCount = 0;
function wemsAnalysisPreviewController($scope, $http) {
    var wemsAnalysisPreviewVM = this;

    wemsAnalysisPreviewVM.powerEfficiencyRows = [];
    wemsAnalysisPreviewVM.analysisDataRows = [];
    wemsAnalysisPreviewVM.analysisPeriod;
    wemsAnalysisPreviewVM.deviceInfoList = [];
    wemsAnalysisPreviewVM.selectedDeviceInfo;
    wemsAnalysisPreviewVM.selectedAnalysisUnit;
    wemsAnalysisPreviewVM.powerSummaryTitle;

    initializeAnalysisData();

    // Initialize Analysis Data
    function initializeAnalysisData() {
        wemsAnalysisPreviewVM.selectedDateUnit = "day";
        wemsAnalysisPreviewVM.selectedAnalysisUnit = "kW";
        wemsAnalysisPreviewVM.powerSummaryTitle = "사용 전력량(kW)";

        var startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        var endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        wemsAnalysisPreviewVM.analysisPeriod = getTimeStamp(startDate) + " ~ " + getTimeStamp(endDate);
        getAnalysisData()
            .then(function (res, status, headers, config) {
                currentAnalysisDataSet = res.data;

                initializeDeviceInfoList(res.data);
                initializePowerData(res.data);
                initializeCumulativeCycleTimeData(res.data);
                initializePowerEfficiency(res.data);
                initializeAnalysisSummayData(res.data);
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

    // Initialize Power Data
    function initializePowerData(analysisDataSet) {
        refreshPowerData(analysisDataSet);
    }

    // Initialize Cumulative Cycle Time Data
    function initializeCumulativeCycleTimeData(analysisDataSet) {
        refreshCumulativeCycleTimeData(analysisDataSet);
    }

    // Initialize Power Efficiency
    function initializePowerEfficiency(analysisDataSet) {
        refreshPowerEfficiency(analysisDataSet);
    }

    // Initialzie Analysis Summary Data
    function initializeAnalysisSummayData(analysisDataSet) {
        refreshAnalysisSummary(analysisDataSet);
    }

    // Initialzie DeviceInfo List
    function initializeDeviceInfoList(analysisDataSet) {
        refreshDeviceInfoList(analysisDataSet);
    }

    // Refresh Analysis Data
    function refreshAnalysisData(period) {
        var start = performance.now();
        if (period) {
            wemsAnalysisPreviewVM.analysisPeriod
                = getTimeStamp(period.startDate)
                + " ~ "
                + getTimeStamp(period.endDate);
        }

        getAnalysisData(period)
            .then(function (res, status, headers, config) {
                currentAnalysisDataSet = res.data;

                refreshDeviceInfoList(res.data);
                refreshPowerData(res.data);
                refreshCumulativeCycleTimeData(res.data);
                refreshPowerEfficiency(res.data);
                refreshAnalysisSummary(res.data);
                var end = performance.now();
                console.log("====================================================");
                console.log("Call Refresh Analysis " + (end - start) + " milliseconds.");
                console.log("====================================================");
            })
            .catch(function (e) {
                var newMessage = 'XHR Failed for getPowerData'
                if (e.data && e.data.description) {
                    newMessage = newMessage + '\n' + e.data.description;
                }

                e.data.description = newMessage;
            });
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
        if (currentFactor != 1) {
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
        if (currentFactor != 1) {
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
                    "CumulativeCycleTime": getNumberWithCommas(analysisData.CycleTime),
                    "PowerEfficiency": analysisData.PowerEfficiency
                });
            }
        }

        showMoreAnalysisSummaryData(true);
    }

    // Show More Analysis Summay Data
    function showMoreAnalysisSummaryData(isInitialize) {
        if (isInitialize == true) {
            analysisSummaryPageCount = 0;
            wemsAnalysisPreviewVM.analysisDataRows = [];
        }

        var startRowIndex = analysisSummaryPageCount * analysisSummaryRowCount;
        var endRowIndex = startRowIndex + analysisSummaryRowCount;
        if (analysisSummaryDataList.length < endRowIndex) {
            endRowIndex = analysisSummaryDataList.length;
            $wemsMoreResultButton.hide();
        } else {
            $wemsMoreResultButton.show();
        }

        for (var analysisSummaryIndex = startRowIndex;
            analysisSummaryIndex < endRowIndex;
            analysisSummaryIndex++) {
            wemsAnalysisPreviewVM.analysisDataRows.push(analysisSummaryDataList[analysisSummaryIndex]);
        }

        analysisSummaryPageCount++;
    }

    // Refresh Device Info List
    function refreshDeviceInfoList(analysisDataSet) {
        if (!analysisDataSet) {
            return;
        }

        wemsAnalysisPreviewVM.deviceInfoList = [];
        wemsAnalysisPreviewVM.deviceInfoList.push({
            DeviceID: 0,
            DeviceName: 'All'
        });

        for (var deviceIndex = 0;
            deviceIndex < analysisDataSet.DeviceIDList.length;
            deviceIndex++) {
            wemsAnalysisPreviewVM.deviceInfoList.push({
                DeviceID: analysisDataSet.DeviceIDList[deviceIndex],
                DeviceName: 'S.C' + analysisDataSet.DeviceIDList[deviceIndex]
            });
        }

        wemsAnalysisPreviewVM.selectedDeviceInfo = wemsAnalysisPreviewVM.deviceInfoList[0];
    }

    // Get Analysis Data
    function getAnalysisData(period) {
        var config = {
            params: period,
            headers: { 'Authorization': 'Basic YmVlcDpib29w' }
        }

        return $http.get('/wems/getAnalysisData/', config);
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
                    = analysisDate.getHours().toString();
                break;

            case "week":
            case "month":
                dateLabelFromDateUnit
                    = moment(analysisDate.toString()).format('YYYY/MM/DD');
                break;

            case "year":
                dateLabelFromDateUnit
                    = moment(analysisDate.toString()).format('YYYY/MM');
                break;

            default:
                dateLabelFromDateUnit
                    = analysisDate.getHours().toString();
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
                if (currentFactor != 1) {
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

                deviceData.push(analysisDataPerDevice[0].CycleTime);
                lastYearData[dataIndex] += analysisDataPerDevice[0].CycleTime;
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

    // On Change Analysis Unit Handler
    function onChangeAnalysisUnitHandler() {
        switch (wemsAnalysisPreviewVM.selectedAnalysisUnit) {
            case "kW":
                currentFactor = 1;
                break;

            case "won":
                currentFactor = costPerkW;
                break;

            default:
                currentFactor = 1;
                break;
        }

        refreshPowerData(currentAnalysisDataSet);
        refreshAnalysisSummary(currentAnalysisDataSet);
    }

    // On Show More Result Handler
    function onShowMoreResultHandler() {
        showMoreAnalysisSummaryData(false);
    }

    // On Show Print Page Handler
    function onShowPrintPageHandler() {
        window.open('wems/analysisPreview', 'popup', 'toolbar=no, menubar=no, resizable=yes');
    }

    // On Select Device Handler
    function onSelectDeviceHandler() {
        refreshPowerData(currentAnalysisDataSet);
        refreshCumulativeCycleTimeData(currentAnalysisDataSet);
        refreshPowerEfficiency(currentAnalysisDataSet);
        refreshAnalysisSummary(currentAnalysisDataSet);
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


