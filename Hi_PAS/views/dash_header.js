// login User
var userName = $('#userName').text();

// User Management Modal hide Event
$('#userManagementModal').on('hidden.bs.modal', function () {
    $('#userAddButton').show();

    $('.container.adduser').fadeOut();
    $('#userCancelButton').hide();
    $('#userEditButton').hide();
    $('#inputname').removeAttr('disabled');

    // search filter init
    $('#userFilter').val('UserName');

    onInitUserValid();
});

// Notice Management Modal hide Event
$('#noticeManagementModal').on('hidden.bs.modal', function () {
    // notice option init
    $('#noticeOption').val('Normal');
    $('#noticeFilter').val('Title');
    onInitUserValid();
});

$scope.onUserManagementLoad = function () {
    onInitUserData();
}

$scope.onNoticeManagementLoad = function () {
    onInitNoticeData();

    $scope.noticeInfo.name = userName;

    // notice calendar
    $("#datetimepicker").datetimepicker({
        format: 'YYYY/MM/DD',
        ignoreReadonly: true,
        showClose: true,
        defaultDate: new Date(),
        minDate: moment()
    });
}

$scope.onOpenRegister = function () {
    $('#userAddButton').hide();

    $('.container.adduser').fadeIn();
    $('#userCancelButton').show();
    $('#userRegisterButton').show();

    onInitUserInfo();
}

$scope.onCloseRegister = function () {

    $('#userAddButton').show();

    $('.container.adduser').fadeOut();
    $('#userCancelButton').hide();
    $('#userRegisterButton').hide();
    $('#userEditButton').hide();
    $('#inputname').removeAttr('disabled');

    onInitUserValid();
}

$scope.onSearchFilterUser = function () { onInitUserData(); }
$scope.onSearchFilterNotice = function () { onInitNoticeData(); }

$scope.onEditUser = function (index) {

    var editUser = $scope.users[index];
    if (!editUser) {
        return false;
    }

    $scope.userInfo.name = editUser.UserName;
    $scope.userInfo.email = editUser.UserEmail;
    $scope.userInfo.phone = editUser.UserPhone;

    $('#inputname').attr('disabled', 'disabled');

    $('.container.adduser').fadeIn();
    $('#userAddButton').hide();
    $('#userCancelButton').show();

    $('#userRegisterButton').hide();
    $('#userEditButton').show();
}

$scope.onEditRegister = function () {
    $('#inputname').removeAttr('disabled');

    $scope.onCloseRegister();

    $('#userRegisterButton').show();
    $('#userEditButton').hide();

    var name = $scope.userInfo.name;
    var email = $scope.userInfo.email;
    var phone = $scope.userInfo.phone;

    updateUserData(name, email, phone);
}

$scope.onEditNotice = function (index) {

    var editNotice = $scope.notices[index];
    if (!editNotice) {
        return false;
    }

    $scope.noticeInfo.id = editNotice.NoticeId;
    $scope.noticeInfo.title = editNotice.NoticeTitle;
    $scope.noticeInfo.name = editNotice.NoticeWriter;
    $("#datetimepicker").data("DateTimePicker").date(editNotice.NoticeEndDate);
    $('#noticeOption').val(editNotice.NoticeOption);
    $scope.noticeInfo.content = editNotice.NoticeContent;

    $('#noticeAdd').show();
    $('#noticeList').hide();

    $('#noticeEditButton').show();
    $('#noticeSaveButton').hide();
}

$scope.onNoticeEditSubmit = function () {
    var rdate = $("#datetimepicker").data("DateTimePicker").date();
    var endDate = new Date(rdate);

    var inputNotice = {};
    inputNotice.id = $scope.noticeInfo.id;
    inputNotice.title = $scope.noticeInfo.title;
    inputNotice.writer = $scope.noticeInfo.name;
    inputNotice.endDate = endDate;
    inputNotice.option = $('#noticeOption').val();
    inputNotice.content = $scope.noticeInfo.content;

    if (inputNotice.title == undefined) { alert('Input Title'); return; }
    if (inputNotice.content == undefined) { alert('Input Content'); return; }

    updateNoticeData(inputNotice);
}

$scope.onDeleteUser = function (index) {
    // delete user
    var deleteUser = $scope.users[index];
    if (!deleteUser) {
        return false;
    }

    // edit value check
    var editValue = $('#inputname').prop('disabled');
    if (editValue) {
        if ($scope.userInfo.name == deleteUser.UserName) {
            alert('This user is currently being edited');
            return false;
        }
    }

    deleteUserData(deleteUser);
}

$scope.onDeleteNotice = function (index) {
    // delete notice
    var deleteNotice = $scope.notices[index];
    if (!deleteNotice) {
        return false;
    }

    deleteNoticeData(deleteNotice);
}

$scope.usersBarCode = function () {
    if ($scope.currentTab == 'BarCode') {
        onMakeBarCode();
        return $scope.users;
    }
}

$scope.onClickTab = function (tabName) {

    if (tabName == 'BarCode') {
        $scope.currentTab = tabName;

        onMakeBarCode();
    }
    if (tabName == 'List') {
        $scope.currentTab = tabName;
    }
}

$scope.onValidation = function (field) {

    var name = $scope.userInfo.name;
    var email = $scope.userInfo.email;
    var phone = $scope.userInfo.phone;

    if (field == 'name') { $scope.registerForm.username.$setValidity("namevalid", onValidateName(name)); return; }
    if (field == 'email') { $scope.registerForm.useremail.$setValidity("emailvalid", onValidateEmail(email)); return; }
    if (field == 'phone') { $scope.registerForm.userphone.$setValidity("phonevalid", onValidatePhone(phone)); return; }
}

// register
$scope.onRegisterFormSubmit = function (form) {

    var name = $scope.userInfo.name;
    var email = $scope.userInfo.email;
    var phone = $scope.userInfo.phone;

    if (onValidateName(name) == false) { alert('Check Form'); return; }
    if (onValidateEmail(email) == false) { alert('Check Form'); return; }
    if (onValidatePhone(phone) == false) { alert('Check Form'); return; }

    onValidateDuplicate(true);

    addUserData(name, email, phone);
}

function onMakeBarCode() {
    for (var index = 0; index < $scope.users.length; index++) {

        var name = $scope.users[index].UserName;
        var id = '#myBarcode' + name;

        $(id).JsBarcode(name, { width: 1, height: 40, displayValue: false });
    }
}

$scope.onNoticeMore = function () {

    $scope.noticeMoreCount++;
    getNoticeData($scope.noticePageSize, $scope.noticeMoreCount);
}

$scope.onUserMore = function () {
    $scope.userMoreCount++;
    getUserData($scope.userPageSize, $scope.userMoreCount);
}

$scope.onNoticeTitleOpen = function (index) {
    var cContent = '#noticeContent' + index;

    if ($(cContent).css('display') == 'none') {
        $(cContent).fadeIn();

        if ($scope.notices[index].NoticeRead == false) {
            addNoticeUserReadData(index, userName);
        }
    }
    else {
        $(cContent).fadeOut();
    }
}

$scope.onNoticeAdd = function () {
    $('#noticeAdd').show();
    $('#noticeList').hide();

    $('#noticeEditButton').hide();
    $('#noticeSaveButton').show();

    $scope.onNoticeReset();
}

$scope.onNoticeList = function () {
    $('#noticeAdd').hide();
    $('#noticeList').show();

    $('#noticeEditButton').hide();
    $('#noticeSaveButton').show();

    $scope.onNoticeReset();
}

$scope.onNoticeSave = function () {

    var rdate = $("#datetimepicker").data("DateTimePicker").date();
    var endDate = new Date(rdate);

    var inputNotice = {};
    inputNotice.title = $scope.noticeInfo.title;
    inputNotice.writer = $scope.noticeInfo.name;
    inputNotice.endDate = endDate;
    inputNotice.option = $('#noticeOption').val();
    inputNotice.content = $scope.noticeInfo.content;

    if (inputNotice.title == undefined) { alert('Input Title'); return; }
    if (inputNotice.content == undefined) { alert('Input Content'); return; }

    addNoticeData(inputNotice);
}

$scope.onNoticeReset = function () {
    $scope.noticeInfo.title = undefined;
    $("#datetimepicker").data("DateTimePicker").date(new Date());
    $('#noticeOption').val('Normal');
    $scope.noticeInfo.content = undefined;
}

$scope.onNoticeRepeatEnd = function () {
    /// XXX
}

/////////////////////////////////////////////////////////////////Initialize/////////////////////////////////////////////////////////////////
function onInitNoticeData() {
    $scope.notices = [];
    $scope.noticeMoreCount = 0;
    $scope.noticeIndex = 0;

    getNoticeData($scope.noticePageSize, $scope.noticeMoreCount);
    getNoticeDataNewCount();
}

function onInitUserData(){
    $scope.users = [];
    $scope.userMoreCount = 0;

    getUserData($scope.userPageSize, $scope.userMoreCount);
}

function onInitUserInfo() {

    $scope.userInfo.name = undefined;
    $scope.userInfo.email = undefined;
    $scope.userInfo.phone = undefined;
}

function onInitUserValid() {

    $scope.registerForm.username.$setValidity('duplicate', true);
    $scope.registerForm.username.$setValidity('namevalid', true);
    $scope.registerForm.useremail.$setValidity('emailvalid', true);
    $scope.registerForm.userphone.$setValidity('phonevalid', true);
}

/////////////////////////////////////////////////////////////////Validate/////////////////////////////////////////////////////////////////
function onValidateDuplicate(result) {
    $scope.registerForm.username.$setValidity("duplicate", result);
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
    var filterValue = $('#userFilter').val();
    var searchValue = $scope.searchText == undefined ? '' : $scope.searchText;

    $http.get('/pms/getUsersData', {
        params: {
            pageSize: pageSizeValue,
            pageIndex: pageIndexValue,
            filter: filterValue,
            search: searchValue,
            date: (new Date()).getTime()
        }
    }).then(function (response) {

        for (var index in response.data.users) {
            var user = response.data.users[index];
            
            $scope.users.push(user);
        }
    }, function (err) {
        console.log(err);
    });
}

function getNoticeData(pageSize, moreCount) {

    var pageSizeValue = pageSize;
    var pageIndexValue = moreCount;
    var filterValue = $('#noticeFilter').val();
    var searchValue = $scope.searchTextNotice == undefined ? '' : $scope.searchTextNotice;
    var userValue = userName;

    $http.get('/pms/getNoticesData', {
        params: {
            pageSize: pageSizeValue,
            pageIndex: pageIndexValue,
            filter: filterValue,
            search: searchValue,
            user: userValue,
            date: (new Date()).getTime()
        }
    }).then(function (response) {

        for (var index in response.data.notices) {
            var notice = response.data.notices[index];
            notice.NoticeIndex = $scope.noticeIndex;

            if (notice.NoticeOption == 'Normal') {
                $scope.noticeIndex++;
            }

            $scope.notices.push(notice);
        }

    }, function (err) {
        console.log(err);
    });
}

function getNoticeDataNewCount() {
    var userValue = userName;

    $http.get('/pms/getNoticesDataNewCount', {
        params: {
            user: userValue,
            date: (new Date()).getTime()
        }
    }).then(function (response) {

        $scope.noticeNewCount = response.data.Count;

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
        noticeId: notice.id,
        noticeTitle: notice.title,
        noticeEndDate: notice.endDate,
        noticeOption: notice.option,
        noticeWriter: notice.writer,
        noticeContent: notice.content
    })
        .success(function (data, status, headers, config) {
            onInitNoticeData();

            $scope.onNoticeReset();
            $scope.onNoticeList();
        })
        .error(function (data, status, header, config) {
            console.log(data.error);
        });
}

function addUserData(name, email, phone) {

    $http.post('/pms/addUserData', {
        userName: name,
        userEmail: email,
        userPhone: phone
    })
        .success(function (data, status, headers, config) {
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
        noticeTitle: notice.title,
        noticeEndDate: notice.endDate,
        noticeOption: notice.option,
        noticeWriter: notice.writer,
        noticeContent: notice.content
    })
        .success(function (data, status, headers, config) {
            onInitNoticeData();

            $scope.onNoticeReset();
            $scope.onNoticeList();
        })
        .error(function (data, status, header, config) {
            console.log('fail');
        });
}

function addNoticeUserReadData(index, readUser) {

    $http.post('/pms/addNoticeUserReadData', {
        noticeId: $scope.notices[index].NoticeId,
        noticeReadUser: readUser
    })
        .success(function (data, status, headers, config) {
            $scope.notices[index].NoticeRead = true;
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
            noticeId: notice.NoticeId,
        }
    })
        .success(function (data, status, headers, config) {
            onInitNoticeData();
        })
        .error(function (data, status, header, config) {
            console.log(data.error);
        });
}

// load
function header_OnLoad() {
    // display
    $scope.users = [];
    // new User input Data
    $scope.userInfo = {};
    // current tab
    $scope.currentTab = null;
    // user count in page
    $scope.userPageSize = 5;
    // user more
    $scope.userMoreCount = 0;
    // user search text
    $scope.searchText = undefined;

    // display
    $scope.notices = [];
    // notice input Data
    $scope.noticeInfo = {};
    // notice count in page
    $scope.noticePageSize = 5;
    // notice index
    $scope.noticeIndex = 0;
    // notice more
    $scope.noticeMoreCount = 0;
    // notice search text
    $scope.searchTextNotice = undefined;

    getNoticeDataNewCount();
}