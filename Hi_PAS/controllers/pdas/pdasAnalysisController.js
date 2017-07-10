angular
    .module('pdasAnalysisApp', ['chart.js'])
    .controller('pdasAnalysisController', ['$scope', '$http', pdasAnalysisController]);

const MACHINE_MAX_COUNT = 9999999;

var currentTrendChart;
var orgCurrentData = {};
function pdasAnalysisController($scope, $http) {
    $scope.period = [{title: '당일',  value: 1   },
                     {title: '1주',   value: 7   },
                     {title: '1개월', value: 30  },
                     {title: '3개월', value: 90  },
                     {title: '1년',   value: 365 }
    ];
    $scope.selectedPeriod = $scope.period[0];
    $scope.machines = ['aa','bb'];
    $scope.selectedMachine = [];
    $scope.selectMachineSettings = {displayProp:'title'};
    $scope.motorType = {
        DrivingMotor: 'DrivingMotor',
        HoistingMotor: 'HoistingMotor',
        ForkMotor: 'ForkMotor'
    };

    initializePdasAnalysisApp($scope, $http);

    $scope.selectPeriod = function () {
        // Step 1. 선택된 기간의 분석데이터 수집
        getAnalysisData($scope.selectedPeriod.value, $http, updateAnalysisContents);
        // Step 2. 컨텐츠 별로 챠트 업데이트
        function updateAnalysisContents(err, anaysisData){
            if(err) {}
            else {
                createMachineInfo($scope, anaysisData.Machines);
                updateCurrentTrendChart($scope, anaysisData.CurrentData);
            }
        }
    }

    $scope.filteringCurrentData = function () {
        var targetMachine = $scope.selectedMachine.value;
        var targetDatasets = [];

        removeCurrentTrendChartData();
        var cpyCurrentData = {
            labels   : orgCurrentData.labels.slice(0),
            datasets : orgCurrentData.datasets.slice(0)
        }
        cpyCurrentData.datasets.forEach(selectDataSets);
        function selectDataSets(dataset) {
            var machineNo = dataset.label.split('_')[0];
            if (machineNo != targetMachine && targetMachine != MACHINE_MAX_COUNT) {
                return;
            }
            var motorType = dataset.label.split('_')[1];
            if (motorType != $scope.motorType.DrivingMotor
                && motorType != $scope.motorType.HoistingMotor
                && motorType != $scope.motorType.ForkMotor) {
                return;
            }
            targetDatasets.push(dataset);
        }
        currentTrendChart.data.labels = cpyCurrentData.labels;
        currentTrendChart.data.datasets = targetDatasets;
        currentTrendChart.update();
    }
}

function createMachineInfo($scope, machineDatas) {
    $scope.machines.splice(0);
    $scope.machines.push({title : '전체', value : MACHINE_MAX_COUNT });
    machineDatas.forEach(function(machineNo) {
        var machineInfo = new Object();
        machineInfo.title = machineNo + '호기';
        machineInfo.value = machineNo;
        $scope.machines.push(machineInfo);
    });
    $scope.selectedMachine = $scope.machines[0];
}
// Initialize Analysis Data
function initializePdasAnalysisApp($scope, $http) {
    // Step 1. 분석 Data 수집
    getAnalysisData($scope.period[0].value, $http, createAnalysisContents);
    // Step 2. 컨텐츠 별로 챠트 생성
    function createAnalysisContents(err, anaysisData){
        if(err) {}
        else {
            createMachineInfo($scope, anaysisData.Machines);
            createCurrentTrendChart($scope, anaysisData.CurrentData);
        }
    }
}

function createCurrentTrendChart($scope, currentData) {
    var chartData = createCurrentChartDatasets($scope, currentData);
    var chartConfig = {
        type: 'line',
        data: chartData,
        options: currentTrendChartOption
    }
    var canvasObj = document.getElementById('currentTrendChart');
    currentTrendChart = new Chart(canvasObj, chartConfig);
}

function updateCurrentTrendChart($scope, currentData) {
    var chartData = createCurrentChartDatasets($scope, currentData);
    //remove
    removeCurrentTrendChartData();
    currentTrendChart.data = chartData;
    $scope.filteringCurrentData($scope);
    //currentTrendChart.update();
}

function removeCurrentTrendChartData() {
    currentTrendChart.data.labels.pop();
    currentTrendChart.data.datasets.pop();
}

function createCurrentChartDatasets($scope, currentData) {
    var chartData = {
        labels: [],
        datasets: []
    };
    var targetMachine = $scope.selectedMachine.value;
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
    orgCurrentData.labels   = chartData.labels.slice(0);
    orgCurrentData.datasets = chartData.datasets.slice(0);

    return chartData;
}

function getAnalysisData(period, $http, callback) {
    if (!$http)
        return null;
    url = "/pdas/dataAnalysis/" + period;
    $http.get(url).success(function (res) {
        return callback(null, res);
    });
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
            radius : 0.8
        },
        line: {
            tension: 0,
            borderWidth: 0.8
        }
    },
    scales: {
        xAxes: [{
            type:'time',
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