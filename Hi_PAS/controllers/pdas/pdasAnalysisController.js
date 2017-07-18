const LARGE_NUMBER = 99999999;
const MILLISECONDS_OF_THE_YEAR = 31536000000;
angular
    .module('pdasAnalysisApp', ['chart.js'])
    .controller('pdasAnalysisController', ['$scope', '$http', pdasAnalysisController]);

var currentTrendChart;
var cycleTimeChart;
var iStockRateChart;
var OEEChart;
var balancingRateChart;
var yieldChart;
var totalIStockRateChart;
var orgCurrentData = {
    labels:[],
    datasets:[]
};

function pdasAnalysisController($scope, $http) {
    var pdasAnalysisVM = this;
    pdasAnalysisVM.Machines = [];
    pdasAnalysisVM.selectedMachine = [];
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

    var $analysisDateTimePickerFrom = $('#analysisDateTimePickerFrom');
    var $analysisDateTimePickerTo = $('#analysisDateTimePickerTo');
    $('#analysisDateTimePickerFrom').datetimepicker({
        format: 'YYYY/MM/DD',
        showClose: true,
        defaultDate: new Date(),
    }).on('dp.change', function(e){
        var fromDate = new Date(e.date);
        var maxDate = new Date(fromDate.getTime() + MILLISECONDS_OF_THE_YEAR);
        $('#analysisDateTimePickerTo').data("DateTimePicker").maxDate(maxDate);
        $('#analysisDateTimePickerTo').data("DateTimePicker").minDate(e.date);
        $('#dateFromChangeFlg').val('true');
    });

    $('#analysisDateTimePickerTo').datetimepicker({
        format: 'YYYY/MM/DD',
        showClose: true,
        defaultDate: new Date(),
    }).on('dp.change', function(e){
        var toDate = new Date(e.date);
        var minDate = new Date(toDate.getTime() - MILLISECONDS_OF_THE_YEAR);
        $('#analysisDateTimePickerFrom').data("DateTimePicker").minDate(minDate);
        $('#analysisDateTimePickerFrom').data("DateTimePicker").maxDate(e.date);
        $('#dateToChangeFlg').val('true');
    });

    initializePdasAnalysisApp();

    pdasAnalysisVM.changeAnalysisDate = function() {
        if($('#dateFromChangeFlg').val() == 'false' && $('#dateToChangeFlg').val() == 'false') {
            return;
        }
        var period = {
            from: new Date($('#analysisDateFrom').val()),
            to: new Date($('#analysisDateTo').val())
        }
        // Step 1. 선택된 기alert($scope.dateTo);간의 분석데이터 수집
        getAnalysisData(period, updateAnalysisContents);
        // Step 2. 컨텐츠 별로 챠트 업데이트
        function updateAnalysisContents(err, anaysisData) {
            if (err) { }
            else {
                removeAnalysisChartData();
                createMachineInfo(anaysisData.Machines);
                updateCurrentTrendChart(anaysisData.CurrentData);
                createCycleTimeChart(anaysisData.CycleTimeData);
                createIStockRateChart(anaysisData.IStockRateData);
            }
        }
        $('#dateFromChangeFlg').val('false');
        $('#dateToChangeFlg').val('false');
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
            if (machineNo != targetMachine && targetMachine != LARGE_NUMBER) {
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
        currentTrendChart.data.labels = cpyCurrentData.labels;
        currentTrendChart.data.datasets = targetDatasets;
        currentTrendChart.update();
    }

    function createMachineInfo(machineDatas) {
        pdasAnalysisVM.Machines.splice(0);
        pdasAnalysisVM.Machines.push({ title: '전체', value: LARGE_NUMBER });
        machineDatas.forEach(function (machineNo) {
            var machineInfo = new Object();
            machineInfo.title = machineNo + '호기';
            machineInfo.value = machineNo;
            pdasAnalysisVM.Machines.push(machineInfo);
        });
        pdasAnalysisVM.selectedMachine = pdasAnalysisVM.Machines[0];
    }

    // Initialize Analysis Data
    function initializePdasAnalysisApp() {
        var period = {
            from: new Date($('#analysisDateFrom').val()),
            to:   new Date($('#analysisDateTo').val())
        }
        // Step 1. 분석 Data 수집
        getAnalysisData(period, createAnalysisContents);
        // Step 2. 컨텐츠 별로 챠트 생성
        function createAnalysisContents(err, anaysisData) {
            if (err) { }
            else {
                createMachineInfo(anaysisData.Machines);
                createCurrentTrendChart(anaysisData.CurrentData);
                createCycleTimeChart(anaysisData.CycleTimeData);
                createIStockRateChart(anaysisData.IStockRateData);
                createOEEChart(null);
                createBalancingRateChart(null);
                createYieldChart(null);
                createTotalISockRateChart(null);
            }
        }
    }

    function createCurrentTrendChart(currentData) {
        var chartData = createCurrentChartDatasets(currentData);
        var chartConfig = {
            type: 'line',
            data: chartData,
            options: currentTrendChartOption
        }
        var canvasObj = document.getElementById('currentTrendChart');
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
                dataset.data.push(val.toFixed(2));
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
        var canvasObj = document.getElementById('cycleTimeChart');
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
        var canvasObj = document.getElementById('iStockRateChart');
        iStockRateChart = new Chart(canvasObj, chartConfig);
    }

    function createOEEChart(OEEData) {
        var canvasObj = document.getElementById('OEEChart');
        gaugeChartConfig.options.title.text = 'OEE: 80%'
        OEEChart = new Chart(canvasObj, gaugeChartConfig);    
    }

    function createBalancingRateChart(OEEData) {
        var canvasObj = document.getElementById('balancingRateChart');
        balancingRateChart = new Chart(canvasObj, doughnutChartConfig);    
    }

    function createYieldChart(OEEData) {
        var canvasObj = document.getElementById('yieldChart');
        yieldChart = new Chart(canvasObj, doughnutChartConfig);    
    }

    function createTotalISockRateChart(OEEData) {
        var canvasObj = document.getElementById('totalIStockRateChart');
        totalIStockRateChart = new Chart(canvasObj, doughnutChartConfig);    
    }

    function updateCurrentTrendChart(currentData) {
        var chartData = createCurrentChartDatasets(currentData);
        currentTrendChart.data = chartData;
        pdasAnalysisVM.filteringCurrentData();
    }
    function removeAnalysisChartData() {
        removeCurrentTrendChartData();
        removeCycleTimeChartData();
        removeIStockRateChartData();
    }

    function removeCurrentTrendChartData() {
        if(currentTrendChart) {
            currentTrendChart.data.labels.pop();
            currentTrendChart.data.datasets.pop();
        }
    }

    function removeCycleTimeChartData() {
        if(cycleTimeChart) {
            cycleTimeChart.data.labels.pop();
            cycleTimeChart.data.datasets.pop();
        }
    }

    function removeIStockRateChartData() {
        if(iStockRateChart) {
            iStockRateChart.data.labels.pop();
            iStockRateChart.data.datasets.pop();
        }
    }

    function createCurrentChartDatasets(currentData) {
        var chartData = {
            labels: [],
            datasets: []
        };
        var targetMachine = pdasAnalysisVM.selectedMachine.value;
        chartData.labels = currentData.labels;
        currentData.dataSets.forEach(function (datasetPerMotor) {
            var color = getRandomColor();
            var dataset = {
                label: datasetPerMotor.label,
                data: datasetPerMotor.datas,
                borderColor: color,
                fill: false,
            }
            chartData.datasets.push(dataset);
        });
        orgCurrentData.labels = chartData.labels.slice(0);
        orgCurrentData.datasets = chartData.datasets.slice(0);

        return chartData;
    }

    function getAnalysisData(period, callback) {
        url = '/pdas/dataAnalysis/' + period.from + '/' + period.to;
        $http.get(url).success(function (res) {
            return callback(null, res);
        });
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
        itemSort: function (i0, i1) {
            var v0 = i0.y;
            var v1 = i1.y;
            return (v0 < v1) ? -1 : (v0 > v1) ? 1 : 0;
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
                //unit: 'minute',
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
                fontSize: 9
            }
        }]
    }
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
                    suggestedMax: ySugMax
                }
            }]
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
        }
    }
}


var doughnutChartConfig = 
{
    type: "doughnut",
    data: {
        datasets: [
            {
                data: [85, 25],
                backgroundColor: [
                    'rgba(153, 223, 89, 1)',
                    'rgba(0, 0, 0, 0.5)',
                ],
                borderWidth: 0,
                hoverBackgroundColor: [
                    'rgb(153, 223, 89)',
                    'rgb(0, 0, 50)',
                ],
                hoverBorderWidth: 0
            },
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: 50,
        rotation: Math.PI * -1.1,
        circumference: Math.PI * 1.2,
        legend: {
            display: true
        },
        tooltips: {
            enabled: true
        },
        title: {
            display: false,
            text: '',
            position: 'left',
            fontColor: 'white'
        }
    }
}