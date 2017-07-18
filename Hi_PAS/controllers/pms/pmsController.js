//angular.module('appPm', []).controller('controllerpmgrid', function () {
angular.module('appPm', [])
    .controller('controllerpmgrid', ['$scope', '$http', controllerpmgrid]);


function controllerpmgrid($scope, $http) {
    //  var DBvm = this;
    $scope.mothersRow = [];
    console.log(Date());
    $scope.onMotherDataLoad = function () {
        console.log("onMotherDataLoad호출");
        getMotherData($http, getdata);//1
        function getdata(err, temp) {
            console.log("2");
            if (err) {
                console.log(err);
            }
            else {
                console.log(temp);
            }
        }
    }
    $scope.file_changed = function (element) {

        $scope.$apply(function (scope) {
            var photofile = element.files[0];
            var fd = new FormData();
            fd.append('ExcelFile', photofile);

            $http.post('/pms/createmother', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
                .success(function () {
                    alert("Excel Import 성공");
                    $scope.onMotherDataLoad();
                })
                .error(function () {
                    alert("Excel Import 실패");
                });
        });
    };

    function getMotherData($http, callback) {
        //2
        $http.get("/pms/displaytable").success(function (res) {
            console.log("1");
            callback(null, res);
            console.log("3");
            $scope.mothersRow = res;
        }, function (err) {
            console.log(err);
        });
    }
    $scope.distinguishTimeGroup = function (Code) {
        var result = 'nothing';
        for (var i = 0; i < $scope.mothersRow.length; i++) {
            if ($scope.mothersRow[i].Code == Code) {
                if ($scope.mothersRow[i].TimeGroup == '시간') {
                    result = '시간 / ' + $scope.mothersRow[i].TimeBaseValue + $scope.mothersRow[i].TimeBaseUnit;
                } else {
                    result = '거리 / ' + $scope.mothersRow[i].nonTimeVaseMainValue + $scope.mothersRow[i].nonTimeVaseMainUnit;
                }
            }
        }
        return result;
    }
}
