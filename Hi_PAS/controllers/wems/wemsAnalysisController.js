﻿angular
    .module('wemsAnalysisApp', ['chart.js'])
    .controller('WemsAnalysisController', ['$scope', '$http', WemsAnalysisController]);

var powerChart;
var cumulativeCycleTimeChart;
var powerEfficiencyBarChart;
var powerEfficiencyLineChart;
/* XXX Max Summary Column Number */
var maxCol = 8;
function WemsAnalysisController($scope, $http) {
    var wemsAnalysisVM = this;

    $('#wemsDetailModal').on('show.bs.modal', onShowWemsDetailModal);

    wemsAnalysisVM.powerEfficiencyRows = [];
    wemsAnalysisVM.analysisDataRows = [];
    wemsAnalysisVM.analysisPeriod;
    wemsAnalysisVM.dateUnit = "day";

    wemsAnalysisVM.onChangeDateUnit = function (value) {
        switch (value) {
            case "day":
                alert("day");
                break;
            case "week":
                alert("week");
                break;
            case "month":
                alert("month");
                break;
            case "year":
                alert("year");
                break;
        }
    }

    /* XXX
    wemAnalysisVM.changeDateUnit = function () {
            switch (wemsAnalysisVM.dateUnit) {
                case "day":
                    alert("day");
                    break;
                case "week":
                    alert("week");
                    break;
                case "month":
                    alert("month");
                    break;
                case "year":
                    alert("year");
                    break;
            }
        }
    */
    //////////////////////////////////////////////////////////////////////
    // On Show Wems Detail Modal 
    function onShowWemsDetailModal() {
        initializeAnalysisData();
    }

    // Initialize Analysis Data
    function initializeAnalysisData() {
        var startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        var endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        var $analysisDateInput = $('#analysisDateinput');
        $analysisDateInput.data('currentVal', $analysisDateInput.val());
        $analysisDateInput.change(function () {
            var $input = $(this);
            var currentValue = $input.val();

            if (currentValue == "") {
                $input.data('currentVal', $input.data('currentVal'));
                this.value = $input.data('currentVal');

                return;
            }
        })
            .focus(function () {
                var $input = $(this);
                $input.data('currentVal', $input.val());
            })
            .keydown(function (e) {
                if (e.keyCode === 13) {
                    var $input = $(this);
                    var currentValue = $input.val();
                    if (currentValue == $input.data('currentVal')) {
                        return;
                    }

                    if (currentValue == "") {
                        $input.data('currentVal', $input.data('currentVal'));
                        this.value = $input.data('currentVal');

                        return;
                    }

                    this.value = currentValue;
                    $input.data('currentVal', currentValue);

                    startDate = new Date(currentValue);
                    endDate = new Date(currentValue);
                    period = {
                        startDate: startDate.setHours(0, 0, 0, 0),
                        endDate: endDate.setHours(23, 59, 59, 999)
                    }

                    refreshAnalysisData(period);
                }
            });

        var $analysisDatePicker = $('#analysisDatePicker');
        $analysisDatePicker.datetimepicker({
            format: 'YYYY/MM/DD',
            showClose: true,
            defaultDate: new Date(),
        })
        .on('dp.change', function () {
            $analysisDatePicker.data("DateTimePicker").hide();
            if (!$analysisDatePicker.data("DateTimePicker").date()) {
                return;
            }

            var selectedDate = $analysisDatePicker.data("DateTimePicker").date().toDate();
            if (!selectedDate) {
                return;
            }

            startDate = new Date(selectedDate);
            endDate = new Date(selectedDate);
            period = {
                startDate: startDate.setHours(0, 0, 0, 0),
                endDate: endDate.setHours(23, 59, 59, 999)
            }

            refreshAnalysisData(period);
        });

        wemsAnalysisVM.analysisPeriod = getTimeStamp(startDate) + " ~ " + getTimeStamp(endDate);
        getAnalysisData()
            .then(function (res, status, headers, config) {
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
                logger.error(newMessage);
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

    function initializeAnalysisSummayData(analysisDataSet) {
        refreshAnalysisSummary(analysisDataSet);
    }

    // Refresh Analysis Data
    function refreshAnalysisData(period) {
        if (period) {
            wemsAnalysisVM.analysisPeriod
                = getTimeStamp(period.startDate)
                + " ~ "
                + getTimeStamp(period.endDate);
        }

        getAnalysisData(period)
            .then(function (res, status, headers, config) {
                refreshPowerData(res.data);
                refreshCumulativeCycleTimeData(res.data);
                refreshPowerEfficiency(res.data);
                refreshAnalysisSummary(res.data);
            })
            .catch(function (e) {
                var newMessage = 'XHR Failed for getPowerData'
                if (e.data && e.data.description) {
                    newMessage = newMessage + '\n' + e.data.description;
                }

                e.data.description = newMessage;
                logger.error(newMessage);
            });
    }

    // Refresh Power Data
    function refreshPowerData(analysisDataSet) {
        if (powerChart) {
            powerChart.destroy();
        }

        var ctx = document
            .getElementById('wemsPowerContent')
            .getContext('2d');

        var labels = getDateLabel(analysisDataSet);
        var datasets = getPowerDataSet(analysisDataSet);
        var powerData = {
            labels: labels,
            datasets: datasets
        };

        var options = {
            title: {
                display: true,
                text: '사용 전력량',
                position: 'top',
                fontSize: 14
            },
            scales: {
                xAxes: [{
                    stacked: true,
                    gridLines: { display: false },
                    scaleLabel: {
                        display: true,
                        labelString: '( hr )'
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        callback: function (value) { return getNumberWithCommas(value); },
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '( kW )'
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
            .getElementById('wemsCycleTimeContent')
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
                        labelString: '( hr )'
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
            .getElementById('wemsPowerEfficiencyBarContent')
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
            .getElementById('wemsPowerEfficiencyLineContent')
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
        wemsAnalysisVM.analysisDataRows = [];
        if (!analysisDataSet || !analysisDataSet.AnalysisData) {
            return;
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
                wemsAnalysisVM.analysisDataRows.push({
                    "Date": analysisDate,
                    "DeviceName": "S.C" + analysisData.MachineID,
                    "Power": getNumberWithCommas(analysisData.Power),
                    "CumulativeCycleTime": getNumberWithCommas(analysisData.CycleTime),
                    "PowerEfficiency": analysisData.PowerEfficiency
                });
            }
        }
    }

    // Get Analysis Data
    function getAnalysisData(period) {
        var config = {
            params: period,
            headers: { 'Authorization': 'Basic YmVlcDpib29w' }
        }

        return $http.get('/wems/analysisData/', config);
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
            dateLabels.push(analysisDate.getHours().toString());
        }

        return dateLabels;
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
            deviceLabelList.push('S.C' + analysisDataSet.DeviceIDList[deviceIndex]);
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
                    || analysisDataPerDevice[0].Power < 0) {
                    deviceData.push(0);
                    if (deviceIndex == 0) {
                        lastYearData.push(0);
                    }

                    continue;
                }

                deviceData.push(analysisDataPerDevice[0].Power);
                if (deviceIndex == 0) {
                    lastYearData.push(analysisDataPerDevice[0].Power);
                    continue;
                }

                lastYearData[dataIndex] += analysisDataPerDevice[0].Power;
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
                    || analysisDataPerDevice[0].CycleTime < 0) {
                    deviceData.push(0);
                    if (deviceIndex == 0) {
                        lastYearData.push(0);
                    }

                    continue;
                }

                deviceData.push(analysisDataPerDevice[0].CycleTime);
                if (deviceIndex == 0) {
                    lastYearData.push(analysisDataPerDevice[0].CycleTime);
                    continue;
                }

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
            powerEfficiencyData.push(powerEfficiency);
            powerEfficiencies.push({
                "DeviceHeader": "장비",
                "PowerEfficiencyHeader": "전력량 효율(%)",
                "Device": "S.C" + analysisDataSet.DeviceIDList[deviceIndex],
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
    function changeDateUnitHandler() {
    }
}   


    