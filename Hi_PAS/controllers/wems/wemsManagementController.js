angular
    .module('wemsManagementApp', ['chart.js'])
    .controller('WemsManagementController', ['$scope', '$http', '$rootScope', WemsManagementController]);

var oldThreshold1 = 0;
var oldThreshold2 = 0;
var oldStandardPower = 0;
var oldCost = 0;
function WemsManagementController($scope, $http, $rootScope) {
    var wemsManagementVM = this;
    $('#ID_WEMS_detailModal').on('show.bs.modal', onShowWemsDetailModal);
    $('#ID_WEMS_detailPageTab a').on('shown.bs.tab', function (e) {
        if (e.target.hash === "#ID_WEMS_managementSection") {
            $scope.$apply(revertManagementData);
        }

    });

    wemsManagementVM.onCheckNumber = onCheckNumberHandler;
    wemsManagementVM.onClickSetting = onClickSettingHandler;
    wemsManagementVM.onClickCancel = onClickCancelHandler;

    //////////////////////////////////////////////////////////////////////
    // On Show Wems Detail Modal 
    function onShowWemsDetailModal() {
        initializeManagementData();
    }

    // Initialzie Management Data
    function initializeManagementData() {
        getManagementData()
            .then(function (res, status, headers, config) {
                wemsManagementVM.threshold1 = res.data.Threshold1;
                wemsManagementVM.threshold2 = res.data.Threshold2;
                wemsManagementVM.standardPower = res.data.StandardPower;
                wemsManagementVM.cost = res.data.Cost;

                oldThreshold1 = res.data.Threshold1;
                oldThreshold2 = res.data.Threshold2;
                oldStandardPower = res.data.StandardPower;
                oldCost = res.data.Cost;

                $rootScope.$broadcast('initalizeManagementDataEvent', res.data);
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

    // Get Management Data
    function getManagementData() {
        return $http.get('/wems/getManagementData/');
    }

    // On Check Number Handler
    function onCheckNumberHandler($event) {
        $event = ($event) ? $event : window.event;
        var charCode = ($event.which) ? $event.which : $event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            revertManagementData($event.currentTarget.id);
            alert("You can input only positive number.");

            return;
        }

        return;
    }

    // On Setting Click Handler
    function onClickSettingHandler() {
        $http.put('/wems/updateManagementData/', {
            Threshold1: wemsManagementVM.threshold1,
            Threshold2: wemsManagementVM.threshold2,
            StandardPower: wemsManagementVM.standardPower,
            Cost: wemsManagementVM.cost
        })
            .success(function (res, status, headers, config) {
                oldThreshold1 = wemsManagementVM.threshold1;
                oldThreshold2 = wemsManagementVM.threshold2;
                oldStandardPower = wemsManagementVM.standardPower;
                oldCost = wemsManagementVM.cost;

                $rootScope.$broadcast('updateManagementDataEvent', {
                    Threshold1: wemsManagementVM.threshold1,
                    Threshold2: wemsManagementVM.threshold2,
                    StandardPower: wemsManagementVM.standardPower,
                    Cost: wemsManagementVM.cost
                });

                alert("Management data updating is successed!");
            })
            .error(function (res, status, headers, config) {
                alert("Management data updating is failed!");
                console.log(res.error);
            });
    }

    // On Cancel Click Handler
    function onClickCancelHandler() {
        revertManagementData();
    }

    // Revert Management Data
    function revertManagementData(currentTargetID) {
        switch (currentTargetID) {
            case "threshold1":
                wemsManagementVM.threshold1 = oldThreshold1;
                break;

            case "threshold2":
                wemsManagementVM.threshold2 = oldThreshold2;
                break;

            case "standardPower":
                wemsManagementVM.standardPower = oldStandardPower;
                break;

            case "cost":
                wemsManagementVM.cost = oldCost;
                break;

            default:
                wemsManagementVM.threshold1 = oldThreshold1;
                wemsManagementVM.threshold2 = oldThreshold2;
                wemsManagementVM.standardPower = oldStandardPower;
                wemsManagementVM.cost = oldCost;
                break;
        }
    }
}