/* PMS Restful API Handler */

var dbManager = require('../utility/dbManager/pmsDBManager');
var pmsUserInfo = require('../models/pms/userInfoData.json');

var motherjson = require("../models/pms/mother.json");
var multer = require('multer')
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

module.exports.loginUserData = function (req, res) {

}

module.exports.addUserLevelData = function (req, res) {
    var param = {
        'level': req.body.level,
        'levelName': req.body.levelName
    };

    dbManager.insertUserLevelData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    })
}

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
        'noticeEndDate': req.body.noticeEndDate,
        'noticeOption': req.body.noticeOption,
        'noticeWriter': req.body.noticeWriter,
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

module.exports.addNoticeUserReadData = function (req, res) {
    var param = {
        'noticeId': req.body.noticeId,
        'noticeReadUser': req.body.noticeReadUser
    }

    dbManager.insertNoticeUserReadData(param, function (result, err) {
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

module.exports.updateNoticeData = function (req, res) {
    var param = {
        'noticeId': req.body.noticeId,
        'noticeTitle': req.body.noticeTitle,
        'noticeEndDate': req.body.noticeEndDate,
        'noticeOption': req.body.noticeOption,
        'noticeWriter': req.body.noticeWriter,
        'noticeContent': req.body.noticeContent
    };

    dbManager.updateNoticeData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getLoginData = function (req, res) {
    var param = {
        'UserName': req.query.UserName
    };

    dbManager.findUserData(param, function (result, err, user) {
        if (result) {
            req.session.user = user;
            res.redirect('/');
        }
        else {
            res.redirect('/');
        }
    });
}

module.exports.getUsersData = function (req, res) {
    var param = {
        'pageSizeValue': req.query.pageSize,
        'pageIndexValue': req.query.pageIndex,
        'filterValue': req.query.filter,
        'searchValue': req.query.search
    };

    dbManager.findUsersData(param, function (result, err, users) {
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

module.exports.getNoticesDataNewCount = function (req, res) {
    var param = {
        'userValue': req.query.user
    };
    dbManager.findNoticesDataNewCount(param, function (result, err, count) {
        if (result) {
            res.send({ 'Count': count });
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getNoticesData = function (req, res) {
    var param = {
        'pageSizeValue': req.query.pageSize,
        'pageIndexValue': req.query.pageIndex,
        'filterValue': req.query.filter,
        'searchValue': req.query.search,
        'user': req.query.user
    };

    dbManager.findNoticesData(param, function (result, err, notices) {
        if (result) {
            var noticeArray = [];

            for (var index in notices) {
                var currentDate = convertDateToString(new Date());
                var noticeDate = convertDateToString(notices[index].StartDate);

                var noticeTime = (notices[index].StartDate).toTimeString().substring(0, 5);

                var pmsNoticeInfo = {};
                pmsNoticeInfo.NoticeId = notices[index].id;
                pmsNoticeInfo.NoticeTitle = notices[index].Title;
                pmsNoticeInfo.NoticeWriter = notices[index].Writer;
                pmsNoticeInfo.NoticeDate = noticeDate + ' ' + noticeTime;
                pmsNoticeInfo.NoticeOption = notices[index].Option;
                pmsNoticeInfo.NoticeContent = notices[index].Content;
                pmsNoticeInfo.NoticeEndDate = convertDateToString(notices[index].EndDate);
                pmsNoticeInfo.NoticeIndex = Number(param.pageSizeValue * param.pageIndexValue) + Number(index);

                pmsNoticeInfo.NoticeRead = false;
                for (var readIndex in notices[index].ReadInfo) {
                    if (notices[index].ReadInfo[readIndex].name == param.user) {
                        pmsNoticeInfo.NoticeRead = true;
                        break;
                    }
                }

                pmsNoticeInfo.NoticeNew = false;
                if (currentDate == noticeDate) {
                    pmsNoticeInfo.NoticeNew = true;
                }

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
        'userName': req.query.userName,
        'userEmail': req.query.userEmail,
        'userPhone': req.query.userPhone,
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

module.exports.deleteNoticeData = function (req, res) {
    var param = {
        'noticeId': req.query.noticeId
    };

    dbManager.deleteNoticeData(param, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.AddMotherData = function (req, res) {
    //모수가 json으로 입력됨,post 방식.
    console.log("AddMotherData 실행");
    var motherdata = JSON.parse(JSON.stringify(req.body));
    saveMotherDataJsonToDB(motherdata);
}
saveMotherDataJsonToDB = function (input) {
    dbManager.InsertMotherdata(input, function (result, err) {
        if (result == 1/*정상처리*/) {
            console.log("[AddMotherData]data 정상 처리");

        }
        else if (result == 2/*중복 발생*/) {
            console.log("[AddMotherData]중복 발생");

        }
        else if (result == 3/*findone error 발생*/) {
            console.log("[AddMotherData]findone error 발생");
            //res.status(505).json({ error: err });
        }
        else if (result == 4/*InsertData가 null*/) {
            console.log("[AddMotherData]InsertData가 null");

        }
        else if (result == 5/*Model save 실패*/) {
            console.log("[AddMotherData]model save 실패");

        }
        else {
            console.log("[AddMotherData] 뭐.");

        }
    });
}

var storage = multer.diskStorage({ //업로드 된 파일의 저장 장소 정의.
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
var upload = multer({ // 저장 장소 저장 하고 확장자 설정.( xls, xlsx 둘 다 읽을 수 있도록)
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');
module.exports.ImportExcel = function (req, res) {
    var exceltojson;
    //위에서 설정된 upload 매소드 실행.
    //req.file 으로 입력 된다.
    upload(req, res, function (err) {
        if (err) {
            // 설정된 값으로 upload 매소드를 실행하는데 에러가 있으면 여기 들어옴. ex)upload할 경로가 없을 때
            res.json({ error_code: 1, err_desc: err });
            return;
        }
        /** Multer gives us file info in req.file object */
        // 경로상 읽을 파일이 없으면 file이 없다. 
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }
        /** Check the extension of the incoming file and 
         *  use the appropriate module
         */
        //업로드된 파일을 지지고볶음.
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: false
            }, function (err, result) {
                if (err) {
                    return res.json({ error_code: 1, err_desc: err, data: null });
                }
                //추출한 제이슨. db에 저장한다. 
                res.json({ error_code: 0, err_desc: null, data: result });
                for (var i = 0; ((i < result.length) && result[i].코드 != ""); i++) {
                    //컴버터가 필요하다. excel 양식 -> schema 양식에 맞게.
                    var convertdJson = CoverteforSave(result[i]);
                    //변환이 끝난 json 은 저장 
                    saveMotherDataJsonToDB(convertdJson);
                }
            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted excel file" });
        }
    })
}
CoverteforSave = function (rawjson) {
    var result = motherjson;
    result.Code = rawjson.코드;
    result.Title = rawjson.제목;
    result.Content = rawjson.내용;
    result.LargeCategory = rawjson.대분류;
    result.MediumCategory = rawjson.중분류;
    result.SmallCategory = rawjson.소분류;
    result.CreateDate = Date();
    result.TimeGroup = rawjson.주기;
    result.TimeBaseUnit = rawjson.시간단위;
    result.TimeBaseValue = rawjson.value1;
    result.nonTimeVaseMainUnit = rawjson.거리단위;
    result.nonTimeBaseMainValue = rawjson.value2;
    result.nonTimeBaseWarringUnit = rawjson.경고값설정_거리단위;
    result.nonTimeBaseWarringValue = rawjson.value3;
    result.Relation = rawjson.연관코드;
    result.Type = rawjson.유형;
    result.Level = rawjson.등급;
    return result;
}

module.exports.pmsrend = function (req, res) {
    res.render('./pms/pms_main.ejs');
}

function convertDateToString(cDate) {
    var convertDate = null;

    try {
        convertDate = cDate.getFullYear() + '-' + (cDate.getMonth() + 1) + '-' + cDate.getDate();
    }
    catch (err) {
        console.log(err);
    }

    return convertDate;
}