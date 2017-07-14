angular
    .module('wemsManagementApp', ['chart.js'])
    .controller('WemsManagementController', ['$scope', '$http', WemsManagementController]);

var oldPowerEfficiency1 = 0;
var oldPowerEfficiency2 = 0;
var oldStandardPower = 0;
var oldCostPerKW = 0;
function WemsManagementController($scope, $http) {
    var wemsManagementVM = this;
    $('#wemsDetailModal').on('show.bs.modal', onShowWemsDetailModal);

    wemsManagementVM.powerEfficiency1 = 0;
    wemsManagementVM.powerEfficiency2 = 0;
    wemsManagementVM.standardPower = 0;
    wemsManagementVM.costPerKW = 0;

    wemsManagementVM.onCheckNumber = onCheckNumberHandler;
    wemsManagementVM.onSettingClick = onSettingClickHandler;
    wemsManagementVM.onCancelClick = onCancelClickHandler;

    //////////////////////////////////////////////////////////////////////
    // On Show Wems Detail Modal 
    function onShowWemsDetailModal() {
        /// initializeManagementData();
    }

    // Initialzie Management Data
    function initializeManagementData() {
        getManagementData()
            .then(function (res, status, headers, config) {
                wemsManagementVM.powerEfficiency1 = res.data.PowerEfficiency1;
                wemsManagementVM.powerEfficiency2 = res.data.PowerEfficiency2;
                wemsManagementVM.standardPower = res.data.StandardPower;
                wemsManagementVM.costPerKW = res.data.CostPerKW;

                oldPowerEfficiency1 = res.data.PowerEfficiency1;
                oldPowerEfficiency2 = res.data.PowerEfficiency2;
                oldStandardPower = res.data.StandardPower;
                oldCostPerKW = res.data.CostPerKW;
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
    function onSettingClickHandler() {
        $http.post('/wems/updateManagementData/', {
            PowerEfficiency1: wemsManagementVM.powerEfficiency1,
            PowerEfficiency2: wemsManagementVM.powerEfficiency2,
            StandardPower: wemsManagementVM.standardPower,
            CostPerKW: wemsManagementVM.costPerKW
        })
            .success(function (res, status, headers, config) {
                oldPowerEfficiency1 = wemsManagementVM.powerEfficiency1;
                oldPowerEfficiency2 = wemsManagementVM.powerEfficiency2;
                oldStandardPower = wemsManagementVM.standardPower;
                oldCostPerKW = wemsManagementVM.costPerKW;

                console.log("Management data updating is success.");
            })
            .error(function (res, status, headers, config) {
                alert("Management data updating is failed!");
                console.log(res.error);
            });
    }

    // On Cancel Click Handler
    function onCancelClickHandler() {
        revertManagementData();
    }

    // Revert Management Data
    function revertManagementData(currentTargetID) {
        switch (currentTargetID) {
            case "powerEfficiency1":
                wemsManagementVM.powerEfficiency1 = oldPowerEfficiency1;
                break;

            case "powerEfficiency2":
                wemsManagementVM.powerEfficiency2 = oldPowerEfficiency2;
                break;

            case "standardPower":
                wemsManagementVM.standardPower = oldStandardPower;
                break;

            case "costPerKW":
                wemsManagementVM.costPerKW = oldCostPerKW;
                break;

            default:
                wemsManagementVM.powerEfficiency1 = oldPowerEfficiency1;
                wemsManagementVM.powerEfficiency2 = oldPowerEfficiency2;
                wemsManagementVM.standardPower = oldStandardPower;
                wemsManagementVM.costPerKW = oldCostPerKW;
                break;
        }
    }
}