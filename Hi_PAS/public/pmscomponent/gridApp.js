var app = angular.module('Gridapp', ['ngTouch', 'ui.grid', 'ui.grid.autoResize']);
 
app.controller('GridMainCtrl', ['$scope', '$http', '$log', function ($scope, $http, $log) {
  $scope.gridOptions = {};
 
  $scope.gridOptions.columnDefs = [
    { name:'id', width:50 },
    { name:'name', width:100, pinnedLeft:true },
    { name:'age', width:100, pinnedRight:true  },
    { name:'address.street', width:150  }

  ];
 
  //$http.get('/data/500_complex.json')
  //  .success(function(data) {
        $scope.gridOptions.data =[
       {
           "id": "Cox",
           "name": "barney",
           "age": "Enormo",
           "address.street": true
        },
       {
           "id": "Cox",
           "name": "zarney",
           "age": "Enormo",
           "address.street": true
       },
       {
           "id": "Cox",
           "name": "Tarney",
           "age": "Enormo",
           "address.street": true
       }
    ];


 
  $scope.randomSize = function () {
    var newHeight = Math.floor(Math.random() * (300 - 100 + 1) + 300);
    var newWidth = Math.floor(Math.random() * (600 - 200 + 1) + 200);
 
    angular.element(document.getElementsByClassName('grid')[0]).css('height', newHeight + 'px');
    angular.element(document.getElementsByClassName('grid')[0]).css('width', newWidth + 'px');
  };
}]);
