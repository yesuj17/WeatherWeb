
/* PM Javascript */


/* Variables */
dashVM.pmsEventList = [];
dashVM.pmsMemoList = null;

/* Export Function declare */
dashVM.pmsShowMemo = pmsShowMemo;
dashVM.pmsShowPMSMainModal = pmsShowPMSMainModal;

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
                dashPMSGetMemoInfoList(b.format('YYYY-MM'));            
            }
        },
        eventClick: function (event, jsEvent, view) {
            dashPMSOnClickEventGroup(event);	            
        },
        eventDrop: function (event, delta, revertFunc) {      
            revertFunc();                  
        },
        dayClick: function (date, jsEvent, view) {            
        }
    });
}

function pmsShowPMSMainModal() {
    $('#ID_PMS_mainModal').modal({ backdrop: 'static', keyboard: false });             
}

function pmsShowMemo(targetDate) {

    $http.get('/pms/GetMemoInfo', {
        params: {
            TargetDate: targetDate            
        }
    }).then(function (response) {
        if (response.data) {
            $('#ID_PMS_dashCalendarMemoInfoModal').modal();
            dashVM.pmsMemoList = response.data;                 
        }
    }, function (err) {
        console.log(err);
    });
}

/* Private functions ****************************************************************/
function dashPMSConvertToCalenderEvent(info) {

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

function dashPMSGetMemoInfoList(month) {

    $http.get('/pms/GetMemoInfoList', {
        params: {
            month: month
        }
    }).then(function (response) {
        if (response.data) {
            
            var infos = response.data;

            for (var i = 0; i < infos.length; i++) {
                dashPMSEnableMemoIcon(infos[i].Date, infos[i].Exist);            
            }    
        }

    }, function (err) {
        console.log(err);
    });    
}

function dashPMSEnableMemoIcon(targetDate, enable) {

    var el = $('[data-date="' + targetDate + '"]');

    if (el) {
        var prevHtml = el[1].innerHTML;

        if (enable == "true") {
            var memoHtml = '<i class="fa fa-envelope" aria-hidden="true" style="color: #FFCC00" ng-click=dashVM.pmsShowMemo("' + targetDate + '")></i>';            
            el[1].innerHTML = prevHtml + memoHtml;
            $compile(el)($scope);            
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
    
    $('#ID_PMS_dashCalendarGroupEventListModal').modal();

    $('#ID_PMS_dashCalendarGroupEventListTitle').html(event.title + ' (' + event.start.format() + ')');
    $('#ID_PMS_dashSelectedEventGroupType').val(event.groupType);
    $('#ID_PMS_dashSelectedDate').val(event.start.format());
    
    $('#ID_PMS_dashCalendarChangeScheduleDatePicker').datetimepicker({
        locale: 'ko',
        format: 'YYYY-MM-DD',
        dayViewHeaderFormat: 'YYYY MMMM',
        ignoreReadonly: true
    });		
    $('#ID_PMS_dashCalendarChangeScheduleTargetDate').val(event.start.format());

    dashPMSGetEventList(event);
}