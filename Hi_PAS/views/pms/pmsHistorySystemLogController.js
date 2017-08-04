angular.module('pmsHistorySystemLogApp', [])
    .controller('PMSHistorySystemLogController', ['$scope', '$http', PMSHistorySystemLogController]);

function PMSHistorySystemLogController($scope, $http) {
    pmsHistorySystemLogVM = this;

    /* Variables */
    pmsHistorySystemLogVM.SystemLogList = [];

    pmsHistorySystemLogVM.LoadSystemLogList = LoadSystemLogList;

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.hash === "#ID_PMS_MenuHistorySystemLog") {
            InitControl();            
        }
    });

    function LoadSystemLogList() {

        $http.get('/pms/getSystemLogList', {
            params: {
                StartDate: $('#ID_PMS_SystemLogSearchStartDate').val(),
                EndDate: $('#ID_PMS_SystemLogSearchEndDate').val()
            }
        }).then(function (response) {
            if (response.data) {
                pmsHistorySystemLogVM.SystemLogList = response.data;
            }

        }, function (err) {
            console.log(err);
        });
    }
    
    function InitControl() {
        var endDate = moment();
        var startDate = moment().subtract(7, 'days');        

        $('#ID_PMS_SystemLogSearchStartDatePicker').datetimepicker({
            locale: 'ko',
            format: 'YYYY-MM-DD',
            date: startDate,
            dayViewHeaderFormat: 'YYYY MMMM',
            ignoreReadonly: true
        });
        $('#ID_PMS_SystemLogSearchStartDatePicker').on("dp.change", function (event) {

            var start = $('#ID_PMS_SystemLogSearchStartDatePicker').data("DateTimePicker").date();
            var end = $('#ID_PMS_SystemLogSearchEndDatePicker').data("DateTimePicker").date();

            if (start > end) {
                $('#ID_PMS_SystemLogSearchEndDatePicker').datetimepicker({
                    date: start
                });

                $('#ID_PMS_SystemLogSearchEndDate').val(start.format("YYYY-MM-DD"));
            }

            LoadSystemLogList();
        });		

        $('#ID_PMS_SystemLogSearchStartDate').val(startDate.format("YYYY-MM-DD"));

        $('#ID_PMS_SystemLogSearchEndDatePicker').datetimepicker({
            locale: 'ko',
            format: 'YYYY-MM-DD',
            date: endDate,
            dayViewHeaderFormat: 'YYYY MMMM',
            ignoreReadonly: true
        });
        $('#ID_PMS_SystemLogSearchEndDatePicker').on("dp.change", function (e) {

            var start = $('#ID_PMS_SystemLogSearchStartDatePicker').data("DateTimePicker").date();
            var end = $('#ID_PMS_SystemLogSearchEndDatePicker').data("DateTimePicker").date();

            if (start > end) {
                $('#ID_PMS_SystemLogSearchStartDatePicker').datetimepicker({
                    date: end
                });

                $('#ID_PMS_SystemLogSearchStartDate').val(end.format("YYYY-MM-DD"));
            }

            LoadSystemLogList();
        });		

        $('#ID_PMS_SystemLogSearchEndDate').val(endDate.format("YYYY-MM-DD"));

        pmsHistorySystemLogVM.LoadSystemLogList();
    }
}
