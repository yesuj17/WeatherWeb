angular
    .module('pdasAnalysisApp', ['chart.js'])
    .controller('pdasAnalysisController', ['$scope', '$http', pdasAnalysisController]);

function pdasAnalysisController($scope, $http) {
    initializeAnalysisData($scope, $http);
}   

// Initialize Analysis Data
function initializeAnalysisData($scope,  $http) {
    initializeCurrentTrendData($scope,  $http);
}

function initializeCurrentTrendData($scope,  $http) {
    var canvasObj = document.getElementById('currentTrendChart');
    
    // Chart.defaults.global.defaultFontColor = 'white';
    var myChart = new Chart(canvasObj, {
        type: 'line',
        data: GetCurrentTrendDataNew(null, $http),
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title:{
                display: true,
                text:'전류 Trend 분석'
            },
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    fontColor: 'white'
                }
            }, 
            scales: {    
                yAxes: [{
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "left",
                    id: "y-axis-1",
                }, {
                    type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: "right",
                    id: "y-axis-2",
                    // grid line settings
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }],
            }
        }
    });
}

function initializePerformanceData($scope) {

}

function initializePerformanceTrendData($scope) {
    
}

function randomScalingFactor() {
    return Math.round(Math.random() * (30-20) + 20);
};

var chartColors = ['rgb(255, 99, 132)','rgb(255, 159, 64)','rgb(255, 205, 86)','rgb(75, 192, 192)','rgb(54, 162, 235)','rgb(153, 102, 255)','rgb(201, 203, 207)'];
function GetCurrentTrendDataNew(period,  $http) {
    if(!$http)
        return null;

    var url = "/pdas/dataAnalysis";
    if(period)
        url = "/pdas/dataAnalysis/" + preiod;

    var chartData = {
        labels : [],
        datasets : []
    };

    $http.get(url).success(function (res) {
        chartData.labels = res.currentTrendData.labels;
        var cnt = 1;
        res.currentTrendData.dataSets.forEach(function(datasetPerMotor) {
            var color = chartColors.pop();
            var dataset = {
                label : datasetPerMotor.title,
                data  : datasetPerMotor.data,
                borderColor : color,
                backgroundColor : color,
                fill: false,
                yAxisID: 'y-axis-' + cnt
            }
            chartData.datasets.push(dataset);
        });
    });
    return chartData;
}