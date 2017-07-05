/* PMS Restful API Handler */

var dbManager = require('../utility/dbManager/pmsDBManager');
var pmsUserInfo = require('../models/pms/userInfoData.json');

module.exports.addUserData = function (req, res) {
    var param = {
        'userName': req.body.userName,
        'userEmail': req.body.userEmail,
        'userPhone': req.body.userPhone
    };

    dbManager.insertUserData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.addNoticeData = function (req, res) {
    var param = {
        'noticeTitle': req.body.noticeTitle,
        'noticeDate': req.body.noticeDate,
        'noticeOption': req.body.noticeOption,
        'noticeUser': req.body.noticeUser,
        'noticeContent': req.body.noticeContent
    }

    dbManager.insertNoticeData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    })
}

module.exports.updateUserData = function (req, res) {
    var param = {
        'userName': req.body.userName,
        'userEmail': req.body.userEmail,
        'userPhone': req.body.userPhone
    };

    dbManager.updateUserData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getUserDataCount = function (req, res) {
    var param = {
        'filterValue': req.query.filter,
        'searchValue': req.query.search
    };

    dbManager.findUserDataCount(param, function (result, err, count) {
        if (result) {
            res.send({ 'Count': count });
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getUserData = function (req, res) {

    var param = {
        'pageSizeValue': req.query.pageSize,
        'pageIndexValue': req.query.pageIndex,
        'filterValue': req.query.filter,
        'searchValue': req.query.search
    };

    dbManager.findUserData(param, function (result, err, users) {
        if (result) {
            var userArray = [];
            for (var index in users) {

                var pmsUserInfo = {};
                pmsUserInfo.UserIndex = Number(param.pageSizeValue * param.pageIndexValue) + Number(index);
                pmsUserInfo.UserName = users[index].UserName;
                pmsUserInfo.UserEmail = users[index].UserEmail;
                pmsUserInfo.UserPhone = users[index].UserPhone;

                userArray.push(pmsUserInfo);
            }

            res.send({ users: userArray });
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getNoticeDataCount = function (req, res) {
    var param = {
        'filterValue': req.query.filter,
        'searchValue': req.query.search
    };

    dbManager.findNoticeDataCount(param, function (result, err, count) {
        if (result) {
            res.send({ 'Count': count });
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getNoticeData = function (req, res) {
    var param = {
        'pageSizeValue': req.query.pageSize,
        'pageIndexValue': req.query.pageIndex,
        'filterValue': req.query.filter,
        'searchValue': req.query.search
    };

    dbManager.findNoticeData(param, function (result, err, notices) {
        if (result) {
            var noticeArray = [];
            for (var index in notices) {

                var pmsNoticeInfo = {};
                pmsNoticeInfo.NoticeIndex = Number(param.pageSizeValue * param.pageIndexValue) + Number(index);
                pmsNoticeInfo.NoticeTitle = notices[index].Title;
                pmsNoticeInfo.NoticeUser = notices[index].UserName;
                pmsNoticeInfo.NoticeDate = (notices[index].StartDate).toISOString().substring(0, 10);
                pmsNoticeInfo.NoticeOption = notices[index].Option;
                pmsNoticeInfo.NoticeContent = notices[index].Content;

                noticeArray.push(pmsNoticeInfo);
            }

            res.send({ notices: noticeArray });
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.deleteUserData = function (req, res) {
    var param = {
        'userName': req.body.userName,
        'userEmail': req.body.userEmail,
        'userPhone': req.body.userPhone,
    };

    dbManager.deleteUserData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}




