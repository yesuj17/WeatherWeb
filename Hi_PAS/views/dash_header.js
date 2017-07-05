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

$scope.onUserManagementLoad = function () {
    getUserDataCount();
    getUserData();
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

$scope.onSearchFilterUser = function () {
    $scope.currentPage = 0;

    getUserDataCount();
    getUserData();
}

$scope.onChangePage = function (index) {
    $scope.currentPage = index;
    getUserDataCount();
    getUserData();
}

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

// Initialize
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

// Validate
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

// http
function getUserDataCount() {
    var pageSizeValue = $scope.userPageSize;
    var filterValue = $('#userFilter').val();
    var searchValue = $scope.searchText == undefined ? '' : $scope.searchText;

    $http.get('/pms/getUserDataCount', {
        params: {
            filter: filterValue,
            search: searchValue,
            date: (new Date()).getTime()
        }
    })
        .then(function (response) {

            var totalCount = response.data.Count;
            $scope.userPageCount = new Array(Math.ceil(totalCount / pageSizeValue));

        }, function (err) {
            console.log(err);
        });
}

function getUserData() {

    var pageSizeValue = $scope.userPageSize;
    var pageIndexValue = $scope.currentPage;
    var filterValue = $('#userFilter').val();
    var searchValue = $scope.searchText == undefined ? '' : $scope.searchText;

    $http.get('/pms/getUserData', {
        params: {
            pageSize: pageSizeValue,
            pageIndex: pageIndexValue,
            filter: filterValue,
            search: searchValue,
            date: (new Date()).getTime()
        }
    }).then(function (response) {
        $scope.users = response.data.users;

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
            getUserData();
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

            getUserDataCount();
            getUserData();
        })
        .error(function (data, status, header, config) {

            if (data.error == 'duplicate') {
                onValidateDuplicate(false);
            }
        });
}

function deleteUserData(user) {
    $http.post('/pms/deleteUserData', {
        userName: user.UserName,
    })
        .success(function (data, status, headers, config) {
            getUserDataCount();
            getUserData();
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
    // current page
    $scope.currentPage = 0;
    // user count in page
    $scope.userPageSize = 5;
    // user page count
    $scope.userPageCount = 0;
    // user search text
    $scope.searchText = undefined;
}