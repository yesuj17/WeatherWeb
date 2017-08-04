angular.module('pmsHistoryMaintLogApp', [])
    .controller('PMSHistoryMaintLogController', ['$scope', '$http', PMSHistoryMaintLogController]);

function PMSHistoryMaintLogController($scope, $http) {
    pmsHistoryMaintLogVM = this;

    /* Variables */
    pmsHistoryMaintLogVM.HistoryList = [];

    pmsHistoryMaintLogVM.LoadMaintHistory = LoadMaintHistory;
    pmsHistoryMaintLogVM.ShowDetailHistory = ShowDetailHistory;
    pmsHistoryMaintLogVM.CloseDetailHistory = CloseDetailHistory;    

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.hash === "#ID_PMS_MenuHistoryMaintLog") {
            InitControl();
        }
    });

    function LoadMaintHistory() {

        $http.get('/pms/getMaintHistoryList', {
            params: {
                StartDate: $('#ID_PMS_MaintHistorySearchStartDate').val(),
                EndDate: $('#ID_PMS_MaintHistorySearchEndDate').val()
            }
        }).then(function (response) {
            if (response.data) {
                pmsHistoryMaintLogVM.HistoryList = response.data;
            }

        }, function (err) {
            console.log(err);
        });
    }

    function CloseDetailHistory() {
        $('#ID_PMS_HistoryDetailModal').modal('toggle');
    }

    function ShowDetailHistory() {
        $('#ID_PMS_HistoryDetailModal').modal();
    }

    function InitControl() {
        var endDate = moment();
        var startDate = moment().subtract(7, 'days');

        $('#ID_PMS_MaintHistorySearchStartDatePicker').datetimepicker({
            locale: 'ko',
            format: 'YYYY-MM-DD',
            date: startDate,
            dayViewHeaderFormat: 'YYYY MMMM',
            ignoreReadonly: true
        });
        $('#ID_PMS_MaintHistorySearchStartDatePicker').on("dp.change", function (e) {

            var start = $('#ID_PMS_MaintHistorySearchStartDatePicker').data("DateTimePicker").date();
            var end = $('#ID_PMS_MaintHistorySearchEndDatePicker').data("DateTimePicker").date();

            if (start > end) {
                $('#ID_PMS_MaintHistorySearchEndDatePicker').datetimepicker({
                    date: start
                });

                $('#ID_PMS_MaintHistorySearchEndDate').val(start.format("YYYY-MM-DD"));
            }

            LoadMaintHistory();
        });	
        $('#ID_PMS_MaintHistorySearchStartDate').val(startDate.format("YYYY-MM-DD"));

        $('#ID_PMS_MaintHistorySearchEndDatePicker').datetimepicker({
            locale: 'ko',
            format: 'YYYY-MM-DD',
            date: endDate,
            dayViewHeaderFormat: 'YYYY MMMM',
            ignoreReadonly: true
        });
        $('#ID_PMS_MaintHistorySearchEndDatePicker').on("dp.change", function (e) {

            var start = $('#ID_PMS_MaintHistorySearchStartDatePicker').data("DateTimePicker").date();
            var end = $('#ID_PMS_MaintHistorySearchEndDatePicker').data("DateTimePicker").date();

            if (start > end) {
                $('#ID_PMS_MaintHistorySearchStartDatePicker').datetimepicker({
                    date: end
                });

                $('#ID_PMS_MaintHistorySearchStartDate').val(end.format("YYYY-MM-DD"));
            }

            LoadMaintHistory();
        });	
        $('#ID_PMS_MaintHistorySearchEndDate').val(endDate.format("YYYY-MM-DD"));

        pmsHistoryMaintLogVM.LoadMaintHistory();
    }

}
