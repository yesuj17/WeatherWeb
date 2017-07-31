
/* PM Javascript */

/* Variables */
dashVM.headerLogInUserName = $('#ID_HEADER_LogInUserName').text();

// default
dashVM.headerCurrentTab = null;
dashVM.headerUserPageSize = 5;
dashVM.headerUserMoreCount = 0;
dashVM.headerNoticePageSize = 5;
dashVM.headerNoticeIndex = 0;
dashVM.headerNoticeMoreCount = 0;

// display
dashVM.headerUsers = [];
dashVM.headerUserInfo = {};
dashVM.headerRegisterForm = {};
dashVM.headerNotices = [];
dashVM.headerNoticeInfo = {};

dashVM.headerUserSearchText;
dashVM.headerNoticeSearchText;
dashVM.headerNoticeNewCount;

/* Export Function declare */
// load
dashVM.headerOnUserManagementLoad = headerOnUserManagementLoad;
dashVM.headerOnNoticeManagementLoad = headerOnNoticeManagementLoad;
// search
dashVM.headerOnSearchFilterUser = headerOnSearchFilterUser;
dashVM.headerOnSearchFilterNotice = headerOnSearchFilterNotice;
// ui
dashVM.headerOnOpenRegister = headerOnOpenRegister;
dashVM.headerOnCloseRegister = headerOnCloseRegister;
dashVM.headerOnEditUser = headerOnEditUser;
dashVM.headerOnNoticeTitleOpen = headerOnNoticeTitleOpen;
// api
dashVM.headerOnDeleteUser = headerOnDeleteUser;
dashVM.headerOnDeleteNotice = headerOnDeleteNotice;
dashVM.headerOnRegisterFormSubmit = headerOnRegisterFormSubmit;
dashVM.headerOnEditRegister = headerOnEditRegister;
dashVM.headerOnNoticeList = headerOnNoticeList;
dashVM.headerOnNoticeAdd = headerOnNoticeAdd;
dashVM.headerOnNoticeReset = headerOnNoticeReset;
dashVM.headerOnNoticeEdit = headerOnNoticeEdit;
dashVM.headerOnNoticeSave = headerOnNoticeSave;
dashVM.headerOnNoticeEditSubmit = headerOnNoticeEditSubmit;
// more
dashVM.headerOnUserMore = headerOnUserMore;
dashVM.headerOnNoticeMore = headerOnNoticeMore;
// etc
dashVM.headerOnValidation = headerOnValidation;
dashVM.headerOnUsersBarCode = headerOnUsersBarCode;
dashVM.headerOnClickTab = headerOnClickTab;

/* OnLoad() call from index */
function header_OnLoad() {
    getNoticeDataNewCount();
}

// Management Modal hide Event
$('#ID_HEADER_UserManagementModal').on('hidden.bs.modal', function () {
    $('#ID_HEADER_UserAddButton').show();

    $('.container.adduser').fadeOut();
    $('#ID_HEADER_UserCancelButton').hide();
    $('#ID_HEADER_UserEditButton').hide();
    $('#ID_HEADER_Inputname').removeAttr('disabled');

    $('#ID_HEADER_UserFilter').val('UserName');

    onInitUserValid();
    dashVM.headerUserSearchText = undefined;
});
$('#ID_HEADER_NoticeManagementModal').on('hidden.bs.modal', function () {
    $('#ID_HEADER_NoticeOption').val('Normal');
    $('#ID_HEADER_NoticeFilter').val('Title');

    dashVM.headerNoticeSearchText = undefined;
});

function headerOnUserManagementLoad() {
    onInitUserData();
}
function headerOnNoticeManagementLoad() {
    onInitNoticeData();

    dashVM.headerNoticeInfo.name = dashVM.headerLogInUserName;

    // notice calendar
    $("#ID_HEADER_Datetimepicker").datetimepicker({
        format: 'YYYY/MM/DD',
        ignoreReadonly: true,
        showClose: true,
        defaultDate: new Date(),
        minDate: moment()
    });
}

function headerOnSearchFilterUser() { onInitUserData(); }
function headerOnSearchFilterNotice() { onInitNoticeData(); }

function headerOnOpenRegister() {
    $('#ID_HEADER_UserAddButton').hide();

    $('.container.adduser').fadeIn();
    $('#ID_HEADER_UserCancelButton').show();
    $('#ID_HEADER_UserRegisterButton').show();

    onInitUserInfo();
}

function headerOnCloseRegister() {
    $('#ID_HEADER_UserAddButton').show();

    $('.container.adduser').fadeOut();
    $('#ID_HEADER_UserCancelButton').hide();
    $('#ID_HEADER_UserRegisterButton').hide();
    $('#ID_HEADER_UserEditButton').hide();
    $('#ID_HEADER_Inputname').removeAttr('disabled');

    onInitUserValid();
}

function headerOnEditUser(index) {
    var editUser = dashVM.headerUsers[index];
    if (!editUser) {
        return false;
    }

    dashVM.headerUserInfo.name = editUser.UserName;
    dashVM.headerUserInfo.email = editUser.UserEmail;
    dashVM.headerUserInfo.phone = editUser.UserPhone;

    $('#ID_HEADER_Inputname').attr('disabled', 'disabled');

    $('.container.adduser').fadeIn();
    $('#ID_HEADER_UserAddButton').hide();
    $('#ID_HEADER_UserCancelButton').show();

    $('#ID_HEADER_UserRegisterButton').hide();
    $('#ID_HEADER_UserEditButton').show();
}

function headerOnNoticeTitleOpen(index) {
    var cContent = '#ID_HEADER_NoticeContent' + index;

    if ($(cContent).css('display') == 'none') {
        $(cContent).fadeIn();

        if (dashVM.headerNotices[index].NoticeRead == false) {
            addNoticeUserReadData(index, dashVM.headerLogInUserName);
        }
    }
    else {
        $(cContent).fadeOut();
    }
}

function headerOnDeleteUser(index) {
    // delete user
    var deleteUser = dashVM.headerUsers[index];
    if (!deleteUser) {
        return false;
    }

    // edit value check
    var editValue = $('#ID_HEADER_Inputname').prop('disabled');
    if (editValue) {
        if (dashVM.headerUserInfo.name == deleteUser.UserName) {
            alert('This user is currently being edited');
            return false;
        }
    }

    deleteUserData(deleteUser);
}

function headerOnDeleteNotice(index) {
    // delete notice
    var deleteNotice = dashVM.headerNotices[index];
    if (!deleteNotice) {
        return false;
    }

    deleteNoticeData(deleteNotice);
}

function headerOnRegisterFormSubmit() {
    var name = dashVM.headerUserInfo.name;
    var email = dashVM.headerUserInfo.email;
    var phone = dashVM.headerUserInfo.phone;

    if (onValidateName(name) == false) { alert('Check Form'); return; }
    if (onValidateEmail(email) == false) { alert('Check Form'); return; }
    if (onValidatePhone(phone) == false) { alert('Check Form'); return; }

    onValidateDuplicate(true);

    addUserData(name, email, phone);
}

function headerOnEditRegister() {
    $('#ID_HEADER_Inputname').removeAttr('disabled');

    //$scope.onCloseRegister();
    headerOnCloseRegister();

    $('#ID_HEADER_UserRegisterButton').show();
    $('#ID_HEADER_UserEditButton').hide();

    var name = dashVM.headerUserInfo.name;
    var email = dashVM.headerUserInfo.email;
    var phone = dashVM.headerUserInfo.phone;

    updateUserData(name, email, phone);
}

function headerOnNoticeEdit(index) {
    var editNotice = dashVM.headerNotices[index];
    if (!editNotice) {
        return false;
    }

    var EndDate = moment(editNotice.NoticeEndDate).format('YYYY-MM-DD');

    dashVM.headerNoticeInfo.id = editNotice.NoticeId;
    dashVM.headerNoticeInfo.title = editNotice.NoticeTitle;
    dashVM.headerNoticeInfo.name = editNotice.NoticeWriter;
    $("#ID_HEADER_Datetimepicker").data("DateTimePicker").date(EndDate);
    $('#ID_HEADER_NoticeOption').val(editNotice.NoticeOption);
    dashVM.headerNoticeInfo.content = editNotice.NoticeContent;

    $('#ID_HEADER_NoticeAdd').show();
    $('#ID_HEADER_NoticeList').hide();

    $('#ID_HEADER_NoticeEditButton').show();
    $('#ID_HEADER_NoticeSaveButton').hide();
}

function headerOnNoticeEditSubmit() {
    var rdate = $("#ID_HEADER_Datetimepicker").data("DateTimePicker").date();
    var endDate = new Date(rdate);

    var inputNotice = {};
    inputNotice.id = dashVM.headerNoticeInfo.id;
    inputNotice.title = dashVM.headerNoticeInfo.title;
    inputNotice.writer = dashVM.headerNoticeInfo.name;
    inputNotice.endDate = endDate;
    inputNotice.option = $('#ID_HEADER_NoticeOption').val();
    inputNotice.content = dashVM.headerNoticeInfo.content;

    if (inputNotice.title == undefined) { alert('Input Title'); return; }
    if (inputNotice.content == undefined) { alert('Input Content'); return; }

    updateNoticeData(inputNotice);
}

function headerOnNoticeReset() {
    dashVM.headerNoticeInfo.title = undefined;
    $("#ID_HEADER_Datetimepicker").data("DateTimePicker").date(new Date());
    $('#ID_HEADER_NoticeOption').val('Normal');
    dashVM.headerNoticeInfo.content = undefined;
}

function headerOnNoticeAdd() {
    $('#ID_HEADER_NoticeAdd').show();
    $('#ID_HEADER_NoticeList').hide();

    $('#ID_HEADER_NoticeEditButton').hide();
    $('#ID_HEADER_NoticeSaveButton').show();

    headerOnNoticeReset();
}

function headerOnNoticeList() {
    $('#ID_HEADER_NoticeAdd').hide();
    $('#ID_HEADER_NoticeList').show();

    $('#ID_HEADER_NoticeEditButton').hide();
    $('#ID_HEADER_NoticeSaveButton').show();

    headerOnNoticeReset();
}

function headerOnNoticeSave() {
    var rdate = $("#ID_HEADER_Datetimepicker").data("DateTimePicker").date();
    var endDate = new Date(rdate);

    var inputNotice = {};
    inputNotice.title = dashVM.headerNoticeInfo.title;
    inputNotice.writer = dashVM.headerNoticeInfo.name;
    inputNotice.endDate = endDate;
    inputNotice.option = $('#ID_HEADER_NoticeOption').val();
    inputNotice.content = dashVM.headerNoticeInfo.content;

    if (inputNotice.title == undefined) { alert('Input Title'); return; }
    if (inputNotice.content == undefined) { alert('Input Content'); return; }

    addNoticeData(inputNotice);
}

function headerOnNoticeMore() {
    dashVM.headerNoticeMoreCount++;
    getNoticeData(dashVM.headerNoticePageSize, dashVM.headerNoticeMoreCount);
}

function headerOnUserMore() {
    dashVM.headerUserMoreCount++;
    getUserData(dashVM.headerUserPageSize, dashVM.headerUserMoreCount);
}

function headerOnUsersBarCode() {
    if (dashVM.headerCurrentTab == 'BarCode') {
        onMakeBarCode();
        return dashVM.headerUsers;
    }
}

function headerOnClickTab(tabName) {
    if (tabName == 'BarCode') {
        dashVM.headerCurrentTab = tabName;

        onMakeBarCode();
    }
    if (tabName == 'List') {
        dashVM.headerCurrentTab = tabName;
    }
}

function headerOnValidation(field) {
    var name = dashVM.headerUserInfo.name;
    var email = dashVM.headerUserInfo.email;
    var phone = dashVM.headerUserInfo.phone;

    if (field == 'name') { dashVM.headerRegisterForm.username.$setValidity("namevalid", onValidateName(name)); return; }
    if (field == 'email') { dashVM.headerRegisterForm.useremail.$setValidity("emailvalid", onValidateEmail(email)); return; }
    if (field == 'phone') { dashVM.headerRegisterForm.userphone.$setValidity("phonevalid", onValidatePhone(phone)); return; }
}

/////////////////////////////////////////////////////////////////Initialize/////////////////////////////////////////////////////////////////
function onInitNoticeData() {
    dashVM.headerNotices = [];
    dashVM.headerNoticeMoreCount = 0;
    dashVM.headerNoticeIndex = 0;

    getNoticeData(dashVM.headerNoticePageSize, dashVM.headerNoticeMoreCount);
    getNoticeDataNewCount();
}

function onInitUserData() {
    dashVM.headerUsers = [];
    dashVM.headerUserMoreCount = 0;

    getUserData(dashVM.headerUserPageSize, dashVM.headerUserMoreCount);
}

function onInitUserInfo() {
    dashVM.headerUserInfo.name = undefined;
    dashVM.headerUserInfo.email = undefined;
    dashVM.headerUserInfo.phone = undefined;
}

function onInitUserValid() {
    dashVM.headerRegisterForm.username.$setValidity('duplicate', true);
    dashVM.headerRegisterForm.username.$setValidity('namevalid', true);
    dashVM.headerRegisterForm.useremail.$setValidity('emailvalid', true);
    dashVM.headerRegisterForm.userphone.$setValidity('phonevalid', true);
}

/////////////////////////////////////////////////////////////////Validate/////////////////////////////////////////////////////////////////
function onValidateDuplicate(result) {
    dashVM.headerRegisterForm.username.$setValidity("duplicate", result);
}

function onValidateName(name) {
    if (name === undefined) {
        return true;
    }

    var regex = /^[a-zA-Z0-9@]+$/;
    return regex.test(name);
}

function onValidateEmail(email) {
    if (email === undefined) {
        return true;
    }

    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
}

function onValidatePhone(phone) {
    if (phone === undefined) {
        return true;
    }

    var regex = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    return regex.test(phone);
}

/////////////////////////////////////////////////////////////////HTTP/////////////////////////////////////////////////////////////////
function getUserData(pageSize, moreCount) {

    var pageSizeValue = pageSize;
    var pageIndexValue = moreCount;
    var filterValue = $('#ID_HEADER_UserFilter').val();
    var searchValue = dashVM.headerUserSearchText == undefined ? '' : dashVM.headerUserSearchText;

    $http.get('/pms/getUsersData', {
        params: {
            pageSizeValue: pageSizeValue,
            pageIndexValue: pageIndexValue,
            filterValue: filterValue,
            searchValue: searchValue,
            date: (new Date()).getTime()
        }
    }).then(function (response) {

        for (var index in response.data.users) {
            var user = response.data.users[index];

            dashVM.headerUsers.push(user);
        }
    }, function (err) {
        console.log(err);
    });
}

function getNoticeData(pageSize, moreCount) {

    var pageSizeValue = pageSize;
    var pageIndexValue = moreCount;
    var filterValue = $('#ID_HEADER_NoticeFilter').val();
    var searchValue = dashVM.headerNoticeSearchText == undefined ? '' : dashVM.headerNoticeSearchText;
    var userValue = dashVM.headerLogInUserName;

    $http.get('/pms/getNoticesData', {
        params: {
            pageSizeValue: pageSizeValue,
            pageIndexValue: pageIndexValue,
            filterValue: filterValue,
            searchValue: searchValue,
            user: userValue,
            date: (new Date()).getTime()
        }
    }).then(function (response) {

        for (var index in response.data.notices) {
            var notice = response.data.notices[index];
            notice.NoticeIndex = dashVM.headerNoticeIndex;

            if (notice.NoticeOption == 'Normal') {
                dashVM.headerNoticeIndex++;
            }
            notice.NoticeDate = moment(notice.NoticeDate).format('YYYY-MM-DD HH:mm');
            dashVM.headerNotices.push(notice);
        }

    }, function (err) {
        console.log(err);
    });
}

function getNoticeDataNewCount() {
    var userValue = dashVM.headerLogInUserName;

    $http.get('/pms/getNoticesDataNewCount', {
        params: {
            userValue: userValue,
            date: (new Date()).getTime()
        }
    }).then(function (response) {

        dashVM.headerNoticeNewCount = response.data.Count;

    }, function (err) {
        console.log(err);
    });
}

function updateUserData(name, email, phone) {

    $http.post('/pms/updateUserData', {
        userName: name,
        userEmail: email,
        userPhone: phone
    })
        .success(function (data, status, headers, config) {
            onInitUserData();
        })
        .error(function (data, status, header, config) {
            console.log(data.error);
        });
}

function updateNoticeData(notice) {
    $http.post('/pms/updateNoticeData', {
        NoticeId: notice.id,
        NoticeTitle: notice.title,
        NoticeEndDate: notice.endDate,
        NoticeOption: notice.option,
        NoticeWriter: notice.writer,
        NoticeContent: notice.content
    })
        .success(function (data, status, headers, config) {
            onInitNoticeData();

            headerOnNoticeReset();
            headerOnNoticeList();
        })
        .error(function (data, status, header, config) {
            console.log(data.error);
            if (data.error == 'notice null') {
                alert('This notice dose not exist');
                onInitNoticeData();

                headerOnNoticeReset();
                headerOnNoticeList();
            }
        });
}

function addUserData(name, email, phone) {

    $http.post('/pms/addUserData', {
        userName: name,
        userEmail: email,
        userPhone: phone
    })
        .success(function (data, status, headers, config) {
            dashVM.headerUserSearchText = undefined;
            onInitUserInfo();
            onInitUserValid();

            onInitUserData();
        })
        .error(function (data, status, header, config) {

            if (data.error == 'duplicate') {
                onValidateDuplicate(false);
            }
        });
}

function addNoticeData(notice) {
    $http.post('/pms/addNoticeData', {
        NoticeTitle: notice.title,
        NoticeEndDate: notice.endDate,
        NoticeOption: notice.option,
        NoticeWriter: notice.writer,
        NoticeContent: notice.content
    })
        .success(function (data, status, headers, config) {
            dashVM.headerNoticeSearchText = undefined;
            onInitNoticeData();

            headerOnNoticeReset();
            headerOnNoticeList();
        })
        .error(function (data, status, header, config) {
            console.log('fail');
        });
}

function addNoticeUserReadData(index, readUser) {

    $http.post('/pms/addNoticeUserReadData', {
        noticeId: dashVM.headerNotices[index].NoticeId,
        noticeReadUser: readUser
    })
        .success(function (data, status, headers, config) {
            dashVM.headerNotices[index].NoticeRead = true;
            getNoticeDataNewCount();
        })
        .error(function (data, status, header, config) {
            console.log('fail');
        });
}

function deleteUserData(user) {
    $http.delete('/pms/deleteUserData', {
        params: {
            userName: user.UserName,
            userEmail: user.UserEmail,
            userPhone: user.UserPhone
        }
    })
        .success(function (data, status, headers, config) {
            onInitUserData();
        })
        .error(function (data, status, header, config) {
            console.log(data.error);
        });
}

function deleteNoticeData(notice) {
    $http.delete('/pms/deleteNoticeData', {
        params: {
            NoticeId: notice.NoticeId,
        }
    })
        .success(function (data, status, headers, config) {
            onInitNoticeData();
        })
        .error(function (data, status, header, config) {
            if(data.error == 'notice null'){
                alert('This notice dose not exist');
                onInitNoticeData();
            }
        });
}

/////////////////////////////////////////////////////////////////BarCode/////////////////////////////////////////////////////////////////
function onMakeBarCode() {
    for (var index = 0; index < dashVM.headerUsers.length; index++) {

        var name = dashVM.headerUsers[index].UserName;
        var id = '#ID_HEADER_MyBarcode' + name;

        $(id).JsBarcode(name, { width: 1, height: 40, displayValue: false });
    }
}