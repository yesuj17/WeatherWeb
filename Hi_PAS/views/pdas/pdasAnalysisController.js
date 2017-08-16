angular
    .module('pdasAnalysisApp', ['chart.js', 'angularjs-gauge'])
    .controller('pdasAnalysisController', ['$scope', '$http', pdasAnalysisController]);

var currentTrendChart;
var cycleTimeChart;
var iStockRateChart;
var OEEChart;
var OEETrendChart;
var balancingRateChart;
var yieldChart;
var totalIStockRateChart;
var orgCurrentData = {
    labels:[],
    datasets:[]
};

var LARGE_NUMBER = 99999999;
var MILLISECONDS_OF_THE_YEAR = 31536000000;

function pdasAnalysisController($scope, $http) {
    var pdasAnalysisVM = this;
    pdasAnalysisVM.Machines = [];
    pdasAnalysisVM.selectedMachine = '';
    pdasAnalysisVM.motorType = {
        DrivingMotor: 'DrivingMotor',
        HoistingMotor: 'HoistingMotor',
        ForkMotor: 'ForkMotor'
    };
    // Cycle time summary
    pdasAnalysisVM.avgCycleTime = 0;
    pdasAnalysisVM.maxCycleTime = 0;
    pdasAnalysisVM.minCycleTime = 0;
    // inventory stock rate summary
    pdasAnalysisVM.avgIStockRate = 0;
    pdasAnalysisVM.maxIStockRate = 0;
    pdasAnalysisVM.minIStockRate = 0;
    // OEE
    pdasAnalysisVM.oeeInfo              = {value:'', threshold:{}};
    pdasAnalysisVM.balancingRateInfo    = {value:'', threshold:{}};
    pdasAnalysisVM.yieldInfo            = {value:'', threshold:{}};
    pdasAnalysisVM.iStockRateInfo       = {value:'', threshold:{}};
    // chart.js canvas background color setting
    Chart.pluginService.register({
        beforeDraw: function (chart, easing) {
            if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                var helpers = Chart.helpers;
                var ctx = chart.chart.ctx;
                var chartArea = chart.chartArea;
                ctx.save();
                ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        }
	});

    var $analysisDateTimePickerFrom = $('#ID_PDAS_analysisDateTimePickerFrom');
    var $analysisDateTimePickerTo = $('#ID_PDAS_analysisDateTimePickerTo');
    $('#ID_PDAS_analysisDateTimePickerFrom').datetimepicker({
        format: 'YYYY/MM/DD',
        showClose: true,
        defaultDate: new Date(),
    }).on('dp.change', function(e){
        var fromDate = new Date(e.date);
        var maxDate = new Date(fromDate.getTime() + MILLISECONDS_OF_THE_YEAR);
        $('#ID_PDAS_analysisDateTimePickerTo').data("DateTimePicker").maxDate(maxDate);
        $('#ID_PDAS_analysisDateTimePickerTo').data("DateTimePicker").minDate(e.date);
        $('#ID_PDAS_dateFromChangeFlg').val('true');
    });

    $('#ID_PDAS_analysisDateTimePickerTo').datetimepicker({
        format: 'YYYY/MM/DD',
        showClose: true,
        defaultDate: new Date(),
    }).on('dp.change', function(e){
        var toDate = new Date(e.date);
        var minDate = new Date(toDate.getTime() - MILLISECONDS_OF_THE_YEAR);
        $('#ID_PDAS_analysisDateTimePickerFrom').data("DateTimePicker").minDate(minDate);
        $('#ID_PDAS_analysisDateTimePickerFrom').data("DateTimePicker").maxDate(e.date);
        $('#ID_PDAS_dateToChangeFlg').val('true');
    });

    initializePdasAnalysisApp();
    pdasAnalysisVM.changeAnalysisDate = function() {
        if($('#ID_PDAS_dateFromChangeFlg').val() == 'false' && $('#ID_PDAS_dateToChangeFlg').val() == 'false') {
            return;
        }
        var period = {
            from: new Date($('#ID_PDAS_analysisDateFrom').val()).toString(),
            to: new Date($('#ID_PDAS_analysisDateTo').val()).toString()
        }
        // Step 1. 선택된 기간의 분석데이터 수집
        $("#ID_PDAS_analysisSpinner").show().spin(spinOpts);
        getAnalysisData(period).
        then(function (response) {
            $("#ID_PDAS_analysisSpinner").hide().spin();
            
            removeAnalysisChartData();
            createMachineInfo(response.data.Machines);
            updateCurrentTrendChart(response.data.CurrentData);
            createCycleTimeChart(response.data.CycleTimeData);
            createIStockRateChart(response.data.IStockRateData);
            createOEESummaryChart(response.data.OEESummaryData);
            createOEETrendChart(response.data.OEETrendData);
        }, function err(response){
            $("#ID_PDAS_analysisSpinner").hide().spin();
        });
        $('#ID_PDAS_dateFromChangeFlg').val('false');
        $('#ID_PDAS_dateToChangeFlg').val('false');
    }

    pdasAnalysisVM.filteringCurrentData = function() {
        var targetMachine = pdasAnalysisVM.selectedMachine.value;
        var targetDatasets = [];
        removeCurrentTrendChartData();
        var cpyCurrentData = {
            labels: orgCurrentData.labels.slice(0),
            datasets: orgCurrentData.datasets.slice(0)
        }
        cpyCurrentData.datasets.forEach(selectDataSets);
        function selectDataSets(dataset) {
            var machineNo = dataset.label.split('_')[0];
            if (machineNo != targetMachine && targetMachine != 0) {
                return;
            }
            var motorType = dataset.label.split('_')[1];
            if (motorType != pdasAnalysisVM.motorType.DrivingMotor
                && motorType != pdasAnalysisVM.motorType.HoistingMotor
                && motorType != pdasAnalysisVM.motorType.ForkMotor) {
                return;
            }
            targetDatasets.push(dataset);
        }
        if(currentTrendChart){
            currentTrendChart.data.labels = cpyCurrentData.labels;
            currentTrendChart.data.datasets = targetDatasets;
            currentTrendChart.update();
        }
    }

     pdasAnalysisVM.previewAnalysisResult = function() {
		var currTrendImgData 		= document.getElementById('ID_PDAS_currentTrendChart').toDataURL('image/jpeg');
		var cycleTimeImgData 		= document.getElementById('ID_PDAS_cycleTimeChart').toDataURL('image/jpeg');
		var iStockRateImgData 		= document.getElementById('ID_PDAS_iStockRateChart').toDataURL('image/jpeg');
		var oeeTrendImgData 		= document.getElementById('ID_PDAS_OEETrendChart').toDataURL('image/jpeg');
        localStorage.setItem('oeeInfo', JSON.stringify(pdasAnalysisVM.oeeInfo));
        localStorage.setItem('balancingRateInfo', JSON.stringify(pdasAnalysisVM.balancingRateInfo));
        localStorage.setItem('yieldInfo', JSON.stringify(pdasAnalysisVM.yieldInfo));
        localStorage.setItem('iStockRateInfo', JSON.stringify(pdasAnalysisVM.iStockRateInfo));
       
        var printWin = window.open('/pdas/analysisPreview/', '', 'width=842, height=947, toolbar=no, menubar=no, resizable=no, scrollbars=yes');
		printWin.onload = function(){
			$('#ID_PDAS_PREVIEW_periodFrom',printWin.document).val($('#ID_PDAS_analysisDateFrom').val());
			$('#ID_PDAS_PREVIEW_periodTo',printWin.document).val($('#ID_PDAS_analysisDateTo').val());
			var machineID = $('#ID_PDAS_machine').val()
			$('#ID_PDAS_PREVIEW_machineID',printWin.document).val(machineID == '0'? '전체' : machineID);
			$('#ID_PDAS_PREVIEW_oeeSummary',printWin.document).text($('#ID_PDAS_oeeSummary').text());
			$('#ID_PDAS_PREVIEW_cycleAvg',printWin.document).text($('#ID_PDAS_avgCycleTime').text());
			$('#ID_PDAS_PREVIEW_cycleMin',printWin.document).text($('#ID_PDAS_minCycleTime').text());
			$('#ID_PDAS_PREVIEW_cycleMax',printWin.document).text($('#ID_PDAS_maxCycleTime').text());
			$('#ID_PDAS_PREVIEW_stockRateAvg',printWin.document).text($('#ID_PDAS_avgIStockRate').text());
			$('#ID_PDAS_PREVIEW_stockRateMin',printWin.document).text($('#ID_PDAS_minIStockRate').text());
			$('#ID_PDAS_PREVIEW_stockRateMax',printWin.document).text($('#ID_PDAS_maxIStockRate').text());

			printWin.document.getElementById('ID_PDAS_PREVIEW_imgCurrentTrend').src = currTrendImgData;
			printWin.document.getElementById('ID_PDAS_PREVIEW_imgCycleTime').src = cycleTimeImgData;
			printWin.document.getElementById('ID_PDAS_PREVIEW_imgIStockRate').src = iStockRateImgData;
			printWin.document.getElementById('ID_PDAS_PREVIEW_imgOEETrend').src = oeeTrendImgData;
        } 
    }

    function createMachineInfo(machineDatas) {
        pdasAnalysisVM.Machines.splice(0);
        pdasAnalysisVM.Machines.push({ title: '전체', value: 0 });
        machineDatas.forEach(function (machineNo) {
            var machineInfo = new Object();
            machineInfo.title = machineNo + '호기';
            machineInfo.value = machineNo;
            pdasAnalysisVM.Machines.push(machineInfo);
        });
        
        if($('#ID_PDAS_machine').val() != '?') {
            for(index in pdasAnalysisVM.Machines){
                if(pdasAnalysisVM.Machines[index].value == $('#ID_PDAS_machine').val()) {
                    pdasAnalysisVM.selectedMachine = pdasAnalysisVM.Machines[index];
                    break;
                }
            }
        }
        else {
            pdasAnalysisVM.selectedMachine = pdasAnalysisVM.Machines[0];
        }
    }

    // Initialize Analysis Data
    function initializePdasAnalysisApp() {
        $http.get('/MA/getMachineInfoList').success(function(res){
            pdasAnalysisVM.Machines.push({ title: '전체', value: 0 });
            var machinesInfo = JSON.parse(JSON.stringify(res));
            for(index in machinesInfo) {
                if(machinesInfo[index].Type != 'SC')
                    continue;
                var machineInfo = new Object();
                machineInfo.title = machinesInfo[index].ID + '호기';
                machineInfo.value = machinesInfo[index].ID;
                pdasAnalysisVM.Machines.push(machineInfo);
            }
        });
    }

    function createCurrentTrendChart(currentData) {
        var chartData = createCurrentChartDatasets(currentData);
        addAnnotationsForTrendChart(currentTrendChartOption, localStorage.getItem('currentUpperLimit'), 'Upper limit');
        var chartConfig = {
            type: 'line',
            data: chartData,
            options: currentTrendChartOption
        }
        var canvasObj = document.getElementById('ID_PDAS_currentTrendChart');
        currentTrendChart = new Chart(canvasObj, chartConfig);
    }

    function createCycleTimeChart(cycleTimeData) {
        var chartData = {
            labels: cycleTimeData.labels,
            datasets: []
        }
        var maxCycleTime = {
            ipx:'',
            cycleTime: 0
        };
        var minCycleTime = LARGE_NUMBER;
        var totalCycleTime = 0;
        cycleTimeData.datasets.forEach(function(element){
            var dataset = {
                data: [],
                backgroundColor:[],
                borderWidth:1,
            }
            for(ipx in element.data) {
                var randomColor = getRandomColor();
                var val = parseFloat(element.data[ipx]);
                dataset.data.push(val.toFixed(1));
                dataset.backgroundColor.push('rgb(210, 255, 77)');
                if(maxCycleTime.cycleTime < val) {
                    maxCycleTime.ipx = ipx;
                    maxCycleTime.cycleTime = val;
                }
                if(minCycleTime > val)
                    minCycleTime = val;
                totalCycleTime += val;
            }
            chartData.datasets.push(dataset);
        });
        chartData.datasets[0].backgroundColor[maxCycleTime.ipx] = 'rgb(255, 51, 51)';
        pdasAnalysisVM.avgCycleTime = (totalCycleTime / cycleTimeData.labels.length).toFixed(2);
        pdasAnalysisVM.minCycleTime = minCycleTime.toFixed(2);
        pdasAnalysisVM.maxCycleTime = maxCycleTime.cycleTime.toFixed(2);

        var chartConfig = {
            type: 'bar',
            data: chartData,
            options: getBarChartOptions('(sec)', maxCycleTime.cycleTime)
        };
        var canvasObj = document.getElementById('ID_PDAS_cycleTimeChart');
        cycleTimeChart = new Chart(canvasObj, chartConfig);
    }

    function createIStockRateChart(iStockRateData) {
        var chartData = {
            labels: iStockRateData.labels,
            datasets: []
        }
        var maxIStockRate = {
            ipx:'',
            IStockRate: 0
        };
        var minIStockRate = LARGE_NUMBER;
        var totalIStockRate = 0;
        iStockRateData.datasets.forEach(function(element){
            var dataset = {
                data: [],
                backgroundColor: [],
                borderWidth: 1
            }
            for(ipx in element.data) {
                var randomColor = getRandomColor();
                var val = parseFloat(element.data[ipx]) * 100;
                dataset.data.push(val.toFixed(1));
                dataset.backgroundColor.push('rgb(210, 255, 77)');
                if(maxIStockRate.IStockRate < val) {
                    maxIStockRate.ipx = ipx;
                    maxIStockRate.IStockRate = val;
                }
                if(minIStockRate > val)
                    minIStockRate = val;
                totalIStockRate += val;
            }
            chartData.datasets.push(dataset);
        });
        chartData.datasets[0].backgroundColor[maxIStockRate.ipx] = 'rgb(255, 51, 51)';
        pdasAnalysisVM.avgIStockRate = (totalIStockRate / iStockRateData.labels.length).toFixed(1);
        pdasAnalysisVM.minIStockRate = minIStockRate.toFixed(1);
        pdasAnalysisVM.maxIStockRate = maxIStockRate.IStockRate.toFixed(1);

        var chartConfig = {
            type: 'bar',
            data: chartData,
            options: getBarChartOptions('(%)', 100)
        };
        var canvasObj = document.getElementById('ID_PDAS_iStockRateChart');
        iStockRateChart = new Chart(canvasObj, chartConfig);
    }

    function createOEESummaryChart(OEESummData) {
        createOEEChart(OEESummData.OEE);
        createBalancingRateChart(OEESummData.BalancingRate);
        createYieldChart(OEESummData.Yield);
        createTotalISockRateChart(OEESummData.IStockRate);
    }

    function createOEETrendChart(OEETrendData) {
        addAnnotationsForTrendChart(OEETrendChartOption, localStorage.getItem('oeeLowerLimit'),'Lower limit');
        var config = {
            type: 'line',
            data: createOEETrendChartDatasets(OEETrendData),
            options: OEETrendChartOption
        }
        var canvasObj = document.getElementById('ID_PDAS_OEETrendChart');
        OEETrendChart = new Chart(canvasObj, config);
    }

    function createOEETrendChartDatasets(OEETrendData) {
        var chartData = {
            labels:OEETrendData.labels,
            datasets:[]
        }

        OEETrendData.datasets.forEach(function(element){
            var dataset = new Object();
            dataset.label = element.label;
            dataset.data = [];
            element.data.forEach(function(elem){
                dataset.data.push((elem * 100).toFixed(1));
            });
            dataset.borderColor = getRandomColor();
            chartData.datasets.push(dataset);
        });
        return chartData;
    }

    function createOEEChart(oee) {
        pdasAnalysisVM.oeeInfo.value = (oee * 100).toFixed(1);
        var oeeThreshold = localStorage.getItem('oeeThreshold');
        var array = [];
        if(oeeThreshold){
            array = oeeThreshold.split(",");
        }
        pdasAnalysisVM.oeeInfo.threshold['0']       = { color: '#ff3333'};
        pdasAnalysisVM.oeeInfo.threshold[array[0]]  = { color: '#FF6701'};
        pdasAnalysisVM.oeeInfo.threshold[array[1]]  = { color: '#42A129'};
    }

    function createBalancingRateChart(balancingRate) {
        pdasAnalysisVM.balancingRateInfo.value = (balancingRate*100).toFixed(1);
        pdasAnalysisVM.balancingRateInfo.threshold = {
            '0': { color: '#ff3333' },
            '50': { color: '#FF6701' },
            '80': { color: '#42A129' },
        };
    }

    function createYieldChart(yieldVal) {
        pdasAnalysisVM.yieldInfo.value = (yieldVal*100).toFixed(1);
        pdasAnalysisVM.yieldInfo.threshold = {
            '0': { color: '#ff3333' },
            '50': { color: '#FF6701' },
            '80': { color: '#42A129' },
        };
    }

    function createTotalISockRateChart(iStockRate) {
        pdasAnalysisVM.iStockRateInfo.value = (iStockRate*100).toFixed(1);
        pdasAnalysisVM.iStockRateInfo.threshold = {
            '0': { color: '#42A129' },
            '50': { color: '#FF6701' },
            '80': { color: '#ff3333' },
        };
    }

    function updateCurrentTrendChart(currentData) {
        if(currentTrendChart){
            var chartData = createCurrentChartDatasets(currentData);
            addAnnotationsForTrendChart(currentTrendChartOption, localStorage.getItem('currentUpperLimit'), 'Upper limit');
            currentTrendChart.data = chartData;
        }
        else {
            createCurrentTrendChart(currentData);
        }
        pdasAnalysisVM.filteringCurrentData();
    }

    function addAnnotationsForTrendChart(option, limit, name) {
        var upperLimit = localStorage.getItem('currentUpperLimit');
        if(!limit) {
            return;
        }
        option.annotation = {
            annotations: [{
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: parseInt(limit),
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [7, 3],
                borderDashOffset: 5,
                label: {
                backgroundColor: '',
                yAdjust: -10,
                enabled: true,
                position: 'left',
                content: name
            }
        }]};
    }

    function removeAnalysisChartData() {
        removeCurrentTrendChartData();
        removeCycleTimeChartData();
        removeIStockRateChartData();
        removeOEESummaryChartData();
        removeOEETrendChartData();
    }

    function removeCurrentTrendChartData() {
        if(currentTrendChart) {
            currentTrendChart.data.labels.splice(0);
            currentTrendChart.data.datasets.splice(0);
        }
    }

    function removeCycleTimeChartData() {
        if(cycleTimeChart) {
            cycleTimeChart.data.labels.pop();
            cycleTimeChart.data.datasets.pop();
            cycleTimeChart.destroy();
        }
    }

    function removeIStockRateChartData() {
        if(iStockRateChart) {
            iStockRateChart.data.labels.pop();
            iStockRateChart.data.datasets.pop();
            iStockRateChart.destroy();
        }
    }

    function removeOEESummaryChartData() {
        if(OEEChart) {
            OEEChart.data.labels.pop();
            OEEChart.data.datasets.pop();
            OEEChart.destroy();
        }
        if(balancingRateChart){
            balancingRateChart.data.labels.pop();
            balancingRateChart.data.datasets.pop();
            balancingRateChart.destroy();
        }
        if(yieldChart){
            yieldChart.data.labels.pop();
            yieldChart.data.datasets.pop();
            yieldChart.destroy();
        }
        if(totalIStockRateChart){
            totalIStockRateChart.data.labels.pop();
            totalIStockRateChart.data.datasets.pop();   
            totalIStockRateChart.destroy();      
        }
    }

    function removeOEETrendChartData() {
        if(OEETrendChart) {
            OEETrendChart.data.labels.splice(0);
            OEETrendChart.data.datasets.splice(0);    
        }
    }

    function createCurrentChartDatasets(currentData) {
        var chartData = {
            labels: [],
            datasets: []
        };
        var targetMachine = pdasAnalysisVM.selectedMachine.value;
        for(index in currentData.labels) {
            var newDate = new Date(currentData.labels[index]);
            var aaa = new Date(newDate.toISOString());
            newDate.setTime(newDate.getTime() - (9 * 3600 * 1000))
            chartData.labels.push(newDate);
        }
        
        currentData.dataSets.forEach(function (datasetPerMotor) {
            var color = getRandomColor();
            var dataset = {
                label: datasetPerMotor.label,
                data: datasetPerMotor.datas,
                borderColor: color,
                fill: false,
                showLine: true
            }
            chartData.datasets.push(dataset);
        });
        orgCurrentData.labels = chartData.labels.slice(0);
        orgCurrentData.datasets = chartData.datasets.slice(0);

        return chartData;
    }

    function getAnalysisData(period) {
        var config = {
            params: period,
            headers: { 'Authorization': 'Basic YmVlcDpib29w' }
        }
        var url = '/pdas/dataAnalysis/' + period.from + '/' + period.to;
        return $http.get('/pdas/dataAnalysis/', config);
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}   

var currentTrendChartOption = {
    responsive: true,
    maintainAspectRatio: false,
    title: {},
    legend: {
        position: 'bottom',
        display: true,
        fullWidth: false,
        labels: {
            fontColor: 'white',
            fontSize: 9
        }
    },
    tooltips: {
         callbacks: {
            itemSort: function (i0, i1) {
                var v0 = i0.y;
                var v1 = i1.y;
                return (v0 < v1) ? -1 : (v0 > v1) ? 1 : 0;
            },
            title: function(tooltipItem, data){
                var newDate = new Date(tooltipItem[0].xLabel);
                return newDate.toLocaleDateString("ko-KR", {year:"numeric", month:"numeric", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
            }
        }
    },
    elements: {
        point: {
            radius: 0.8
        },
        line: {
            tension: 0,
            borderWidth: 0.8
        }
    },
    scales: {
        xAxes: [{
            type: 'time',
            gridLines: { display: false },
            scaleLabel: {
                display: false,
                labelString: '(time)'
            },
            time: {
                parser: function(date) {
                    return moment(moment(date).format());
                    //return moment(date).format();
                }
            },
            ticks: {
                display: true,
                fontColor: 'white',
                fontSize: 9
            }
        }],
        yAxes: [{
            type: "linear",
            display: true,
            position: "left",
            scaleLabel: {
                display: true,
                fontSize: 9,
                fontColor: 'white',
                labelString: '(Am)'
            },
            ticks: {
                beginAtZero: false,
                fontColor: 'white',
                fontSize: 9,
            },
        }]
    },
     chartArea: {
        backgroundColor: 'rgb(72, 98, 104)'
    },
    annotation: {}
}

var OEETrendChartOption = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
        position: 'bottom',
        display: true,
        fullWidth: false,
        labels: {
            fontColor: 'white',
            fontSize: 9
        }
    },
    tooltips: {
        callbacks: {
            title: function(tooltipItem, data){
                var newDate = new Date(tooltipItem[0].xLabel);
                return newDate.toLocaleDateString("ko-KR", {year:"numeric", month:"numeric", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
            }
        }
    },
    elements: {
        point: {
            radius: 1.5
        },
        line: {
            tension: 0,
            borderWidth: 1.2
        }
    },
    scales: {
        xAxes: [{
            type: 'time',
            gridLines: { display: false },
            scaleLabel: {
                display: false,
                labelString: '(time)'
            },
            ticks: {
                display: true,
                fontColor: 'white',
                fontSize: 9
            }
        }],
        yAxes: [{
            type: "linear",
            display: true,
            position: "left",
            scaleLabel: {
                display: true,
                fontSize: 9,
                fontColor: 'white',
                labelString: '(%)'
            },
            ticks: {
                beginAtZero: false,
                fontColor: 'white',
                fontSize: 9
            }
        }]
    },
    chartArea: {
        backgroundColor: 'rgb(72, 98, 104)'
    },
    annotation: {}
}

function getBarChartOptions(yLabelStr, ySugMax) {
    return  ({
        responsive: true,
        maintainAspectRatio: false,
        title: {},
        legend: {
            position: 'bottom',
            display: false,
            fullWidth: false,
            labels: {
                fontColor: 'white',
                fontSize: 9
            }
        },
        tooltips: {
        },
        elements: {
        },
        scales: {
            xAxes: [{
                //stacked: true,
                gridLines: { display: false },
                scaleLabel: {
                    display: true,
                    fontSize: 9,
                    fontColor: 'white',
                    labelString: '(Machine No)'
                },
                ticks: {
                    fontColor: 'white',
                    fontSize: 9
                }
            }],
            yAxes: [{
                //stacked: true,
                scaleLabel: {
                    display: true,
                    fontSize: 9,
                    fontColor: 'white',
                    labelString: yLabelStr
                },
                ticks: {
                    fontColor: 'white',
                    fontSize: 9,
                    suggestedMax: ySugMax,
                    beginAtZero:true
                }
            }]
        },
        chartArea: {
           backgroundColor: 'rgb(72, 98, 104)'
        }
    });
}

var gaugeChartConfig = 
{
    type: 'doughnut',
    data: {
        datasets: [
            {
                data: [33, 33, 16.5, 1, 16.5],
                backgroundColor: [
                    'rgba(255, 51, 51, 1)',
                    'rgba(255, 219, 77, 1)',
                    'rgba(153, 223, 89, 1)',
                    'rgba(0, 0, 0, 0.6)',
                    'rgba(153, 223, 89, 1)'
                ],
                borderWidth: 0,
                hoverBackgroundColor: [
                    'rgb(255, 69, 96)',
                    'rgb(206, 148, 73)',
                    'rgb(153, 223, 89)',
                    'rgba(0, 0, 0, 0.6)',
                    'rgb(153, 223, 89)'
                ],
                hoverBorderWidth: 0
            },
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 50,
        rotation: Math.PI,
        circumference: Math.PI,
        legend: {
            display: true
        },
        tooltips: {
            enabled: true
        },
        title: {
            display: false,
            text: '',
            position: 'bottom',
            fontColor: 'white'
        },
        chartArea: {
            backgroundColor: 'rgb(72, 98, 104)'
        }
    }
}

function doughnutChartConfig(name) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 50,
        rotation: Math.PI * -1.1,
        circumference: Math.PI * 1.2,
        legend: {
            display: false
        },
        tooltips: {
            enabled: true
        },
        title: {
            padding: 3,
            display: true,
            text: name,
            position: 'top',
            fontColor: 'white'
        },
        chartArea: {
            backgroundColor: 'rgb(72, 98, 104)'
        }
    }
}

var spinOpts = {
    lines: 13, // The number of lines to draw
    length: 20, // The length of each line
    width: 10, // The line thickness
    radius: 30, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: true, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left:'auto' // Left position relative to parent in px
};