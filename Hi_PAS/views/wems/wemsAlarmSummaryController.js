angular
    .module('wemsAlarmSummaryApp', ['chart.js'])
    .controller('WemsAlarmSummaryController', ['$scope', '$http', WemsAlarmSummaryController]);

var $wemsMoreAlarmButton = $('#ID_WEMS_moreAlarmButton');

var totalAlarmMessageList = [];

var alarmSummaryDataList = [];
var filterAlarmSummaryDataList = [];
var alarmSummaryRowCount = 50;

function WemsAlarmSummaryController($scope, $http) {
    var wemsAlarmSummaryVM = this;

    wemsAlarmSummaryVM.alarmLevel = {
        all: -1,
        info: 0,
        warning: 1,
        error: 2
    };

    wemsAlarmSummaryVM.alarmDataRows = [];
    wemsAlarmSummaryVM.selectedAlarmLevel = wemsAlarmSummaryVM.alarmLevel.all;

    $('#ID_WEMS_alarmSummaryModal').on('show.bs.modal', onShowWemsAlarmSummaryModal);

    $scope.$on('addAlarmMessageEvent', addAlarmMessage);
    wemsAlarmSummaryVM.onShowMoreAlarm = onShowMoreAlarmHandler;
    wemsAlarmSummaryVM.onChangeAlarmLevel = onChangeAlarmLevelHandler;

    initializeAlarmSummay();

    ////////////////////////////////////////////////////
    // WEMS Alarm Summay Controller Method
    function onShowWemsAlarmSummaryModal() {
        showMoreAlarmSummaryData(true);
    }

    function initializeAlarmSummay() {
        getTotalAlarmMessage()
            .then(function (res, status, headers, config) {
                totalAlarmMessageList = res.data;
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

    // Add Alarm Message
    function addAlarmMessage(event, powerEfficiencyStatus) {
        var alarmMessage = getAlarmMessage(powerEfficiencyStatus.alarmCode);
        if (!alarmMessage) {
            return;
        }

        var alarmSummaryData = {
            Level: alarmMessage.Level,
            LevelCode: alarmMessage.LevelCode,
            Message: alarmMessage.Message,
            Device: powerEfficiencyStatus.device,
            Date: moment(powerEfficiencyStatus.date).format('YYYY/MM/DD HH:mm:ss')
        };

        alarmSummaryDataList.push(alarmSummaryData);

        if ((wemsAlarmSummaryVM.selectedAlarmLevel == wemsAlarmSummaryVM.alarmLevel.all) 
            || (wemsAlarmSummaryVM.selectedAlarmLevel == alarmSummaryData.LevelCode)) {
            filterAlarmSummaryDataList.push(alarmSummaryData);

            if (filterAlarmSummaryDataList.length < alarmSummaryRowCount) {
                wemsAlarmSummaryVM.alarmDataRows.push(alarmSummaryData);
            } else {
                $wemsMoreAlarmButton.show();
            }
        }
    }

    // Get Alarm Message
    function getTotalAlarmMessage() {
        return $http.get('/wems/getTotalAlarmMessage/');
    }

    // Show More Alarm Summay Data
    function showMoreAlarmSummaryData(isInitialize) {
        var startRowIndex = wemsAlarmSummaryVM.alarmDataRows.length;
        if (isInitialize == true) {
            startRowIndex = 0;
            wemsAlarmSummaryVM.alarmDataRows = [];
        }

        var endRowIndex = startRowIndex + alarmSummaryRowCount;
        if (filterAlarmSummaryDataList.length < endRowIndex) {
            endRowIndex = filterAlarmSummaryDataList.length;
            $wemsMoreAlarmButton.hide();
        } else {
            $wemsMoreAlarmButton.show();
        }

        for (var alarmSummaryIndex = startRowIndex;
            alarmSummaryIndex < endRowIndex;
            alarmSummaryIndex++) {
            wemsAlarmSummaryVM.alarmDataRows.push(filterAlarmSummaryDataList[alarmSummaryIndex]);
        }
    }

    // On Show More Alarm Handler
    function onShowMoreAlarmHandler() {
        showMoreAlarmSummaryData(false);
    }

    // On Change Alarm Level Handler
    function onChangeAlarmLevelHandler() {
        refreshFilterAlarmSummaryData();
    }

    // Refresh Filter Alarm Summary Data
    function refreshFilterAlarmSummaryData(selectedAlarmLevel) {
        filterAlarmSummaryDataList = [];
        for (var index = 0; index < alarmSummaryDataList.length; index++) {
            if ((wemsAlarmSummaryVM.selectedAlarmLevel != wemsAlarmSummaryVM.alarmLevel.all)
                && (wemsAlarmSummaryVM.selectedAlarmLevel != alarmSummaryDataList[index].LevelCode)) {
                continue;
            }

            filterAlarmSummaryDataList.push(alarmSummaryDataList[index]);
        }

        showMoreAlarmSummaryData(true);
    }

    // Get Alarm Message
    function getAlarmMessage(alarmCode) {
        for (var alarmMessageIndex = 0;
            alarmMessageIndex < totalAlarmMessageList.length;
            alarmMessageIndex++) {
            if (totalAlarmMessageList[alarmMessageIndex].Code
                == alarmCode) {
                return totalAlarmMessageList[alarmMessageIndex];
            }
        }
    }
};