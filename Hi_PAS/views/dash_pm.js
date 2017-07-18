
/* PM Javascript */


/* Variables */
dashVM.pmsEventList = [];

/* Export Function declare */
dashVM.pmsChangeSelectedEventSchedule = pmsChangeSelectedEventSchedule;
dashVM.pmsOnSelectedEvent = pmsOnSelectedEvent;

/* OnLoad() call from index */
function pms_OnLoad() {

    /* Calendar */
    $('#ID_PMS_dashCalendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: ''
        },
        locale: 'ko',
        navLinks: false, // can click day/week names to navigate views		
        selectable: false,
        selectHelper: false,
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        eventDurationEditable: false,
        eventSources: [],
        viewRender: function (view, element) {
            if (view.name == 'month') {
                $('#ID_PMS_dashCalendar').fullCalendar('option', 'contentHeight', 530);
                var b = $('#ID_PMS_dashCalendar').fullCalendar('getDate');

                dashPMSGetEventGroupList(b.format('YYYY-MM'));
                dashPMSGetMemoList(b.format('YYYY-MM'));            
            }
        },
        eventClick: function (event, jsEvent, view) {
            dashPMSOnClickEventGroup(event);	            
        },
        eventDrop: function (event, delta, revertFunc) {
            if (confirm('<%=__('S_PMS_CalendarConfirmChangeEventScheduleMsg') %>') == true) {

                // Update Schedule
                //updateTaskDate(event);
            }
            else {
                revertFunc();
            }
        },
        dayClick: function (date, jsEvent, view) {            
        }
    });
}

function pmsChangeSelectedEventSchedule() {

    /* XXX not implemented yet */
    var idList = [];

    for (var i = 0; i < dashVM.pmsEventList.length; i++) {
        var res = $('#ID_PMS_eventUID-' + dashVM.pmsEventList[i].UID).prop('checked');
        if (res == true) {
            idList.push(dashVM.pmsEventList[i].UID);
        }
    } 

    var reqParams = {
        TargetDate: $('#ID_PMS_dashSelectedDate').val(),
        GroupType: $('#ID_PMS_dashSelectedEventGroupType').val(),      
        EventUIDs: idList
    };

    var jsonData = JSON.stringify(reqParams);

    console.log(reqParams);

}

function pmsOnSelectedEvent() {

    for (var i = 0; i < dashVM.pmsEventList.length; i++) {
        var res = $('#ID_PMS_eventUID-' + dashVM.pmsEventList[i].UID).prop('checked');
        if (res == true) {
            $('#ID_dashPMSScheduleMoveButton').css('display', 'block');
            return;
        }            
    }

    $('#ID_dashPMSScheduleMoveButton').css('display', 'none');
}


/* Private functions */
function dashPMSConvertToCalenderEvent(info) {

    var res;
    var title, backColor;

    if (info.GroupType == "daily") {
        title = '<%=__('S_PMS_DailyEventGroupTitle') %>';
        backColor = '#66CCCC';
    }
    else if (info.GroupType == "weekly") {
        title = '<%=__('S_PMS_WeeklyEventGroupTitle') %>';
        backColor = '#CC66FF';
    }
    else if (info.GroupType == "monthly") {
        title = '<%=__('S_PMS_MonthlyEventGroupTitle') %>';
        backColor = '#0033CC';
    }
    else {
        return null;
    }

    res = {
        title: title,
        start: info.Date,
        backgroundColor: backColor,
        textColor: '#FFFFFF',
        existMemo: info.ExistMemo,
        groupType: info.GroupType
    };

    return res;    
}

function dashPMSGetEventList(event) {

    $http.get('/pms/GetEventList', {
        params: {
            TargetDate: event.start.format(),
            GroupType: event.GroupType
        }
    }).then(function (response) {
        if (response.data) {
            dashVM.pmsEventList = response.data;
        }

    }, function (err) {
        console.log(err);
    });
}

function dashPMSGetMemoList(month) {

    /* XXX not implemented yet */
}

function dashPMSEnableMemoIcon(date, enable) {

    var el = $('[data-date="' + date + '"]');

    if (el) {
        var prevHtml = el[1].innerHTML;

        if (enable == true) {
            el[1].innerHTML = prevHtml + '<i class="fa fa-envelope" aria-hidden="true" style="color: #FFCC00"></i>';
        }
        else {
            var startIndex = prevHtml.indexOf('<i');
            var endIndex = prevHtml.lastIndexOf ('/i>');

            if (startIndex != -1) {
                var matchString = prevHtml.substring(startIndex, endIndex + 3);

                el[1].innerHTML = prevHtml.replace(matchString, '');
            }
        }
    }
}

function dashPMSGetEventGroupList(month) {

    $http.get('/pms/GetEventGroupList', {
        params: {
            month: month
        }         
    }).then(function (response) {
        if (response.data) {
            var eventGroupList = [];

            var infos = response.data;

            for (var i = 0; i < infos.length; i++) {

                var data = dashPMSConvertToCalenderEvent(infos[i]);
                if (data) {
                    eventGroupList.push(data);
                }
            }

            $('#ID_PMS_dashCalendar').fullCalendar('removeEvents');            
            $('#ID_PMS_dashCalendar').fullCalendar('addEventSource', eventGroupList);		            
        }                

    }, function (err) {
        console.log(err);
    });
}


function dashPMSOnClickEventGroup(event) {

    // Show modal
    $('#ID_PMS_dashCalendarGroupEventListModal').modal();
    $('#ID_PMS_dashCalendarGroupEventListTitle').html(event.title + ' (' + event.start.format() + ')');
    $('#ID_PMS_dashSelectedEventGroupType').val(event.groupType);
    $('#ID_PMS_dashSelectedDate').val(event.start.format());

    dashPMSGetEventList(event);
}