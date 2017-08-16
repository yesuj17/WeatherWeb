angular
    .module('pmsScheduleMaintApp', [])
    .controller('PMScheduleMaintController', ['$scope', '$http', '$compile', PMScheduleMaintController]);

var TBMDateUnit = {
    Total: 0,
    Day: 1,
    Week: 2, 
    Month: 3
}

function PMScheduleMaintController($scope, $http, $compile) {
    var pmsScheduleMaintVM = this; 

    /* Export Function declare */
    pmsScheduleMaintVM.ChangeSelectedEventSchedule = ChangeSelectedEventSchedule;
    pmsScheduleMaintVM.OnSelectedEvent = OnSelectedEvent;
    pmsScheduleMaintVM.ShowMemo = ShowMemo;
    pmsScheduleMaintVM.CloseMemo = CloseMemo;
    pmsScheduleMaintVM.CloseEvent = CloseEvent;

    pmsScheduleMaintVM.ConvertToCalenderEvent = ConvertToCalenderEvent;
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        if (e.target.hash === "#ID_PMS_MenuScheduleMaint") {
            $('#ID_PMS_scheduleMaintCalendar').fullCalendar('render');   
            initializeTodoList();                
        }        
    });

    $('#ID_PMS_scheduleMaintCalendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        locale: 'ko',
        navLinks: false, // can click day/week names to navigate views		
        selectable: true,
        select: onSelectCalendarDate,
        selectHelper: false,
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        eventDurationEditable: false,
        eventSources: [],
        viewRender: function (view, element) {
            if (view.name == 'month') {
                $('#ID_PMS_scheduleMaintCalendar').fullCalendar('option', 'contentHeight', 530);
                var b = $('#ID_PMS_scheduleMaintCalendar').fullCalendar('getDate');

                GetEventGroupList(b.format('YYYY-MM'));
                GetMemoInfoList(b.format('YYYY-MM'));     
            }
        },
        eventClick: function (event, jsEvent, view) {
            OnClickEventGroup(event);
        },
        eventDrop: function (event, delta, revertFunc) {
            if (confirm('<%=__('S_PMS_CalendarConfirmChangeEventScheduleMsg') %>') == true) {

                var res = confirm('<%=__('S_PMS_CalendarConfirmChangeEventScheduleAutoSyncMsg') %>');

                // Update Schedule
                ChangeEventGroupSchedule(res, event);
            }
            else {
                revertFunc();
            }
        },
        dayClick: function (date, jsEvent, view) {
        }

    });

    function ChangeSelectedEventSchedule() {

        var changePostSchedule = false;

        if (confirm('<%=__('S_PMS_CalendarConfirmChangeEventScheduleMsg') %>') == true) {
            changePostSchedule = confirm('<%=__('S_PMS_CalendarConfirmChangeEventScheduleAutoSyncMsg') %>');
        }
        else {
            return;
        }

        var idList = [];

        for (var i = 0; i < pmsScheduleMaintVM.EventList.length; i++) {
            var res = $('#ID_PMS_eventUID-' + pmsScheduleMaintVM.EventList[i].UID).prop('checked');
            if (res == true) {
                idList.push(pmsScheduleMaintVM.EventList[i].UID);
            }
        }

        $('#ID_PMS_CalendarGroupEventListModal').modal('toggle');

        $http.post('/pms/updateEventsSchedule', {
            params: {
                SourceDate: $('#ID_PMS_SelectedDate').val(),
                TargetDate: $('#ID_PMS_CalendarChangeScheduleTargetDate').val(),
                GroupType: $('#ID_PMS_SelectedEventGroupType').val(),
                OptChangePostSchedule: changePostSchedule,
                EventUIDs: idList
            }
        }).then(function (response) {

        }, function (err) {
            console.log(err);
        });
    }

    function OnSelectedEvent() {

        for (var i = 0; i < pmsScheduleMaintVM.EventList.length; i++) {
            var res = $('#ID_PMS_eventUID-' + pmsScheduleMaintVM.EventList[i].UID).prop('checked');
            if (res == true) {
                $('#ID_PMS_ScheduleMoveControl').css('display', 'block');
                return;
            }
        }

        $('#ID_PMS_ScheduleMoveControl').css('display', 'none');
    }

    function ShowMemo(targetDate) {

        $http.get('/pms/getMemoInfo', {
            params: {
                TargetDate: targetDate
            }
        }).then(function (response) {
            if (response.data) {                
                pmsScheduleMaintVM.MemoList = response.data;
                $('#ID_PMS_CalendarMemoInfoModal').modal();
            }
        }, function (err) {
            console.log(err);
        });
    }

    function CloseMemo() {
        $('#ID_PMS_CalendarMemoInfoModal').modal('toggle');
    }

    function CloseEvent() {
        $('#ID_PMS_CalendarGroupEventListModal').modal('toggle');        
    }

    /* Private functions ****************************************************************/
    function GetEventList(event) {

        $http.get('/pms/GetEventList', {
            params: {
                TargetDate: event.start.format(),
                GroupType: event.GroupType
            }
        }).then(function (response) {
            if (response.data) {
                pmsScheduleMaintVM.EventList = response.data;
            }

        }, function (err) {
            console.log(err);
        });
    }

    function OnClickEventGroup(event) {

        $('#ID_PMS_CalendarGroupEventListModal').modal();

        $('#ID_PMS_ScheduleMoveControl').css('display', 'none');
        $('#ID_PMS_CalendarGroupEventListTitle').html(event.title + ' (' + event.start.format() + ')');
        $('#ID_PMS_SelectedEventGroupType').val(event.groupType);
        $('#ID_PMS_SelectedDate').val(event.start.format());

        $('#ID_PMS_CalendarChangeScheduleDatePicker').datetimepicker({
            locale: 'ko',
            format: 'YYYY-MM-DD',
            dayViewHeaderFormat: 'YYYY MMMM',
            ignoreReadonly: true
        });
        $('#ID_PMS_CalendarChangeScheduleTargetDate').val(event.start.format());

        GetEventList(event);
    }
 
    function ConvertToCalenderEvent(info) {

        var res;
        var title, backColor, txtColor;

        if (info.GroupType == "daily") {
            title = '<%=__('S_PMS_DailyEventGroupTitle') %>';
            backColor = 'rgba(102, 204, 204, 1)';
            txtColor = 'rgba(0, 0, 0, 1)';
        }
        else if (info.GroupType == "weekly") {
            title = '<%=__('S_PMS_WeeklyEventGroupTitle') %>';
            backColor = 'rgba(204, 102, 255, 1)';
            txtColor = 'rgba(0, 0, 0, 1)';
        }
        else if (info.GroupType == "monthly") {
            title = '<%=__('S_PMS_MonthlyEventGroupTitle') %>';
            backColor = 'rgba(0, 51, 204, 1)';
            txtColor = 'rgba(0, 0, 0, 1)';
        }
        else {
            return null;
        }

        var calDate = new Date(info.Date);
        var today = new Date();
        var isPastDay = calDate < today;
        if (isPastDay == true) {
            backColor = backColor.replace(/[^,]+(?=\))/, '0.3')
            txtColor = txtColor.replace(/[^,]+(?=\))/, '0.3')
        }

        res = {
            title: title,
            start: info.Date,
            backgroundColor: backColor,
            textColor: txtColor,
            existMemo: info.ExistMemo,
            groupType: info.GroupType
        };

        return res;
    }

    function GetEventGroupList(month) {

        $http.get('/pms/GetEventGroupList', {
            params: {
                month: month
            }
        }).then(function (response) {
            if (response.data) {
                var eventGroupList = [];

                var infos = response.data;

                for (var i = 0; i < infos.length; i++) {

                    var data = pmsScheduleMaintVM.ConvertToCalenderEvent(infos[i]);
                    if (data) {
                        eventGroupList.push(data);
                    }
                }

                $('#ID_PMS_scheduleMaintCalendar').fullCalendar('removeEvents');
                $('#ID_PMS_scheduleMaintCalendar').fullCalendar('addEventSource', eventGroupList);
            }

        }, function (err) {
            console.log(err);
        });
    }

    function GetMemoInfoList(month) {

        $http.get('/pms/GetMemoInfoList', {
            params: {
                month: month
            }
        }).then(function (response) {
            if (response.data) {

                var infos = response.data;

                for (var i = 0; i < infos.length; i++) {
                    EnableMemoIcon(infos[i].Date, infos[i].Exist);
                }
            }

        }, function (err) {
            console.log(err);
        });
    }

    function EnableMemoIcon(targetDate, enable) {

        var el = $('[data-date="' + targetDate + '"]');

        if (el) {
            var prevHtml = el[1].innerHTML;

            if (enable == "true") {
                var memoHtml = '<i class="fa fa-envelope" aria-hidden="true" style="color: #FFCC00" ng-click=pmsScheduleMaintVM.ShowMemo("' + targetDate + '")></i>';
                el[1].innerHTML = prevHtml + memoHtml;
                $compile(el)($scope);
            }
            else {
                var startIndex = prevHtml.indexOf('<i');
                var endIndex = prevHtml.lastIndexOf('/i>');

                if (startIndex != -1) {
                    var matchString = prevHtml.substring(startIndex, endIndex + 3);
                    el[1].innerHTML = prevHtml.replace(matchString, '');
                }
            }
        }
    }

    function ChangeEventGroupSchedule(changePostSchedule, event) {
        $http.post('/pms/updateEventGroupSchedule', {
            params: {
                GroupType: event.groupType,
                SourceDate: event.start._i,
                TargetDate: event.start.format(),
                OptChangePostSchedule: changePostSchedule
            }
        }).then(function (response) {

        }, function (err) {
            console.log(err);
        });
    }

    // Initizlie Todo List
    function initializeTodoList() {
        var maintDate = new Date();
        getTodoListPerDate(maintDate, TBMDateUnit.Total)
            .then(function (res, status, headers, config) {
                refreshTodoList(res.data);
            })
            .catch(function (e) {
                var newMessage = 'XHR Failed for initializeTodoList'
                if (e.data && e.data.description) {
                    newMessage = newMessage + '\n' + e.data.description;
                }

                e.data.description = newMessage;
            });
    }

    // Refresh Todo List
    function refreshTodoList(todoList) {
        pmsScheduleMaintVM.todoRowList = [];
        for (var todoIndex = 0; todoIndex < todoList.TodoDataList.length; todoIndex++) {
            var todoRow = new Object();
            todoRow.checkDate = todoList.TodoDataList[todoIndex].CheckDate;
            todoRow.level = todoList.TodoDataList[todoIndex].Level;
            todoRow.period = todoList.TodoDataList[todoIndex].Period;
            todoRow.code = todoList.TodoDataList[todoIndex].Code;
            todoRow.summary = todoList.TodoDataList[todoIndex].Title;
            todoRow.largeCategory = todoList.TodoDataList[todoIndex].Machine;
            todoRow.mediumCategory = todoList.TodoDataList[todoIndex].Module;
            todoRow.smallCategory = todoList.TodoDataList[todoIndex].Device;
            todoRow.actionDate = todoList.TodoDataList[todoIndex].ActionDate;
            todoRow.status = todoList.TodoDataList[todoIndex].Status;

            pmsScheduleMaintVM.todoRowList.push(todoRow);
        }
    }

    

    // On Select Calendar Date
    function onSelectCalendarDate(start, end, jsEvent, view) {
        var maintDate = new Date(start.startOf('day'));
        getTodoListPerDate(maintDate, TBMDateUnit.Total)
            .then(function (res, status, headers, config) {
                refreshTodoList(res.data);
            })
            .catch(function (e) {
                var newMessage = 'XHR Failed for initializeTodoList'
                if (e.data && e.data.description) {
                    newMessage = newMessage + '\n' + e.data.description;
                }

                e.data.description = newMessage;
            });
    }
    
    // Get Total Todo List Per Date
    function getTodoListPerDate(maintDate, tbmCheckUnit){ 
        var params = {
            maintDate: maintDate.toString(),
            tbmCheckUnit: tbmCheckUnit
        };

        var config = {
            params: params,
            headers: { 'Authorization': 'Basic YmVlcDpib29w' }
        }

        return $http.get('/pms/getTodoListPerDate/', config);
    }
}
