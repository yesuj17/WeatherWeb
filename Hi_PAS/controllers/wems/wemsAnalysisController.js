angular
    .module('wemsAnalysisApp', ['chart.js'])
    .controller('WemsAnalysisController', ['$scope', '$http', WemsAnalysisController]);

var powerChart;
var cumulativeCycleTimeChart;
var powerEfficiencyBarChart;
var powerEfficiencyLineChart;
var $analysisDatePicker = $('#ID_WEMS_analysisDatePicker');
var $wemsMoreResultButton = $('#ID_WEMS_moreResultButton');
var currentAnalysisDataSet;
var analysisSummaryDataList = [];
var costPerkW = 0;
var currentFactor = 1;
var currentAnalysisUnit = "kW";
var standardPower = 0;

/* Const Max Summary Column Number */
var maxCol = 8;
var analysisSummaryRowCount = 50;
var analysisSummaryPageCount = 0;
function WemsAnalysisController($scope, $http) {
    var wemsAnalysisVM = this;
    $scope.$on('initalizeManagementDataEvent', initializeManagementData);
    $scope.$on('updateManagementDataEvent', updateManagementData);

    $('#ID_WEMS_detailModal').on('show.bs.modal', onShowWemsDetailModal);

    wemsAnalysisVM.powerEfficiencyRows = [];
    wemsAnalysisVM.analysisDataRows = [];
    wemsAnalysisVM.analysisPeriod;
    wemsAnalysisVM.deviceInfoList = [];
    wemsAnalysisVM.selectedDeviceInfo;
    wemsAnalysisVM.selectedAnalysisUnit;
    wemsAnalysisVM.powerSummaryTitle;

    wemsAnalysisVM.onChangeDateUnit = onChangeDateUnitHandler;
    wemsAnalysisVM.onSelectDevice = onSelectDeviceHandler;
    wemsAnalysisVM.onChangeAnalysisUnit = onChangeAnalysisUnitHandler;
    wemsAnalysisVM.onShowMoreResult = onShowMoreResultHandler;
    wemsAnalysisVM.onShowPrintPage = onShowPrintPageHandler;

    initializeComponentEventHandler();

    //////////////////////////////////////////////////////////////////////
    // On Show Wems Detail Modal 
    function onShowWemsDetailModal() {
        initializeAnalysisData();
    }

    // Initialize Analysis Data
    function initializeAnalysisData() {
        wemsAnalysisVM.selectedDateUnit = "day";
        wemsAnalysisVM.selectedAnalysisUnit = "kW";
        wemsAnalysisVM.powerSummaryTitle = "사용 전력량(kW)";

        var startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        var endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        wemsAnalysisVM.analysisPeriod = getTimeStamp(startDate) + " ~ " + getTimeStamp(endDate);
        getAnalysisData()
            .then(function (res, status, headers, config) {
                initializeDeviceInfoList(res.data);
                initializePowerData(res.data);
                initializeCumulativeCycleTimeData(res.data);
                initializePowerEfficiency(res.data);
                initializeAnalysisSummayData(res.data);

                currentAnalysisDataSet = res.data;
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

    function initializeComponentEventHandler() {
        var startDate;
        var endDate;

        $analysisDatePicker.datetimepicker({
            format: 'YYYY/MM/DD',
            showClose: true,
            ignoreReadonly: true,
            maxDate: new Date(),
            defaultDate: new Date()
        })
            .on('dp.change', function () {
                $analysisDatePicker.data("DateTimePicker").hide();
                var selectedDate = $analysisDatePicker.data("DateTimePicker").date()
                if (!selectedDate) {
                    return;
                }

                startDate = new Date(selectedDate.startOf(wemsAnalysisVM.selectedDateUnit));
                endDate = new Date(selectedDate.endOf(wemsAnalysisVM.selectedDateUnit));
                period = {
                    dateUnit: wemsAnalysisVM.selectedDateUnit,
                    startDate: startDate.setHours(0, 0, 0, 0),
                    endDate: endDate.setHours(23, 59, 59, 999)
                }

                refreshAnalysisData(period);
            });
    }

    // Refresh Analysis Data
    function refreshAnalysisData(period) {
        var start = performance.now();
        if (period) {
            wemsAnalysisVM.analysisPeriod
                = getTimeStamp(period.startDate)
                + " ~ "
                + getTimeStamp(period.endDate);
        }

        getAnalysisData(period)
            .then(function (res, status, headers, config) {
                refreshDeviceInfoList(res.data);
                refreshPowerData(res.data);
                refreshCumulativeCycleTimeData(res.data);
                refreshPowerEfficiency(res.data);
                refreshAnalysisSummary(res.data);

                currentAnalysisDataSet = res.data;

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
                        labelString: getXScaleLabelString(wemsAnalysisVM.selectedDateUnit)
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
                        labelString: getXScaleLabelString(wemsAnalysisVM.selectedDateUnit)
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
        calPowerEfficiencyData(analysisDataSet.AnalysisData);

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
                        labelString: getXScaleLabelString(wemsAnalysisVM.selectedDateUnit)
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
        
        wemsAnalysisVM.powerSummaryTitle = "사용 전력량(kW)";
        if (currentAnalysisUnit != "kW") {
            wemsAnalysisVM.powerSummaryTitle = "사용 전력 비용(1000 KRW)";
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
                if (wemsAnalysisVM.selectedDeviceInfo &&
                    (wemsAnalysisVM.selectedDeviceInfo.DeviceID != 0) &&
                    (wemsAnalysisVM.selectedDeviceInfo.DeviceName != deviceName)) {
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
            wemsAnalysisVM.analysisDataRows = [];
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
            analysisSummaryIndex++){
            wemsAnalysisVM.analysisDataRows.push(analysisSummaryDataList[analysisSummaryIndex]);
        }

        analysisSummaryPageCount++;
    }

    // Refresh Device Info List
    function refreshDeviceInfoList(analysisDataSet) {
        if (!analysisDataSet) {
            return;
        }

        wemsAnalysisVM.deviceInfoList = [];
        wemsAnalysisVM.deviceInfoList.push({
            DeviceID: 0,
            DeviceName: 'All'
        });

        for (var deviceIndex = 0;
            deviceIndex < analysisDataSet.DeviceIDList.length;
            deviceIndex++) {
            wemsAnalysisVM.deviceInfoList.push({
                DeviceID: analysisDataSet.DeviceIDList[deviceIndex],
                DeviceName: 'S.C' + analysisDataSet.DeviceIDList[deviceIndex]
            });
        }

        wemsAnalysisVM.selectedDeviceInfo = wemsAnalysisVM.deviceInfoList[0];
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
        switch (wemsAnalysisVM.selectedDateUnit) {
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
            if (wemsAnalysisVM.selectedDeviceInfo &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceName != labelName)) {
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
            if (wemsAnalysisVM.selectedDeviceInfo &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceName != labelName)){
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
            if (wemsAnalysisVM.selectedDeviceInfo &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceName != labelName)) {
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
            if (wemsAnalysisVM.selectedDeviceInfo &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceName != labelName)) {
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

        wemsAnalysisVM.powerEfficiencyRows = [];
        var powerEfficiencyData = [];
        var backGroundColor = [];
        var powerEfficiencies = [];
        for (deviceIndex = 0; deviceIndex < analysisDataSet.DeviceIDList.length; deviceIndex++) {
            var deviceName = "S.C" + analysisDataSet.DeviceIDList[deviceIndex];
            if (wemsAnalysisVM.selectedDeviceInfo &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceID != 0) &&
                (wemsAnalysisVM.selectedDeviceInfo.DeviceName != deviceName)) {
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
                wemsAnalysisVM.powerEfficiencyRows.push(powerEfficiencies);
                powerEfficiencies = [];
            }

            backGroundColor.push(generateRandomRGBA());
        }

        wemsAnalysisVM.powerEfficiencyRows.push(powerEfficiencies);

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

    // Change Date Unit
    function onChangeDateUnitHandler() {
        var startDate;
        switch (wemsAnalysisVM.selectedDateUnit) {
            case "day":
                startDate = moment().startOf('day').toDate();
                $analysisDatePicker.data("DateTimePicker").format('YYYY/MM/DD');
                $analysisDatePicker.data("DateTimePicker").viewMode('days');
                break;

            case "week":
                startDate = moment().startOf('week').toDate();
                $analysisDatePicker.data("DateTimePicker").format('YYYY/MM/DD');
                $analysisDatePicker.data("DateTimePicker").viewMode('days');
                break;

            case "month":
                startDate = moment().startOf('month').toDate();
                $analysisDatePicker.data("DateTimePicker").format('YYYY/MM');
                $analysisDatePicker.data("DateTimePicker").viewMode('months');
                break;

            case "year":
                startDate = moment().startOf('year').toDate();
                $analysisDatePicker.data("DateTimePicker").format('YYYY');
                $analysisDatePicker.data("DateTimePicker").viewMode('years');
                break;

            default:
                startDate = moment().startOf('day').toDate();
                $analysisDatePicker.data("DateTimePicker").format('YYYY/MM/DD');
                $analysisDatePicker.data("DateTimePicker").viewMode('days');
                break;
        }

        $analysisDatePicker.data("DateTimePicker").date(startDate);
    }

    // On Change Analysis Unit Handler
    function onChangeAnalysisUnitHandler() {
        currentAnalysisUnit = wemsAnalysisVM.selectedAnalysisUnit;
        switch (wemsAnalysisVM.selectedAnalysisUnit) {
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
        $http.post('/wems/updateAnalysisPreviewData', {
                costPerkW: costPerkW,
                currentAnalysisUnit: currentAnalysisUnit,
                currentFactor: currentFactor,
                analysisPeriod: wemsAnalysisVM.analysisPeriod,
                selectedDeviceInfo: wemsAnalysisVM.selectedDeviceInfo,
                analysisSummaryRows: wemsAnalysisVM.analysisDataRows.length,
                currentAnalysisDataSet: currentAnalysisDataSet
            })
            .success(function (data, status, headers, config) {
                var analysisPreviewWidnow = window.open('/wems/analysisPreview', 'Analysis Preview', 'width=800, height=1000 toolbar=no, menubar=no, resizable=no, scrollbars=yes');
                if (analysisPreviewWidnow) {
                    analysisPreviewWidnow.focus();
                }
            })
            .error(function (data, status, header, config) {
                console.log(data.error);
            });
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

    // initialize Management Data
    function initializeManagementData(event, managementData) {
        if (!managementData) {
            return;
        }

        var newStandardPower = managementData.StandardPower;
        if (standardPower != newStandardPower) {
            standardPower = newStandardPower;
        }

        var newCostPerkW = managementData.Cost / 1000;
        if (costPerkW == newCostPerkW) {
            return;
        }

        costPerkW = newCostPerkW;
        if (currentAnalysisUnit != "kW") {
            currentFactor = costPerkW;
        }
    }

    // Update Management Data
    function updateManagementData(event, managementData) {
        if (!managementData) {
            return;
        }

        var newStandardPower = managementData.StandardPower;
        if (standardPower != newStandardPower) {
            standardPower = newStandardPower;
            refreshPowerEfficiency(currentAnalysisDataSet);
        }

        var newCostPerkW = managementData.Cost / 1000;
        if (costPerkW == newCostPerkW) {
            return;
        }

        costPerkW = newCostPerkW;
        if (currentAnalysisUnit != "kW") {
            currentFactor = costPerkW;

            refreshPowerData(currentAnalysisDataSet);
            refreshAnalysisSummary(currentAnalysisDataSet);
        }
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
}   


    