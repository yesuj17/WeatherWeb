/* PMS Restful API Handler */
var dbManager = require('../utility/dbManager/pmsDBManager');
var pmsUserInfo = require('../models/pms/userInfoData.json');

var motherjson = require("../models/pms/mother.json");
var multer = require('multer')
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

module.exports.validateUserData = function (req, res){
    var userData = JSON.parse(JSON.stringify(req.body));

    dbManager.findUserData(userData, function (result, err, user) {
        if (result) {
            res.send(user);
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.loginUserData = function (req, res) {

}

module.exports.addUserLevelData = function (req, res) {
    var userLevelData = JSON.parse(JSON.stringify(req.body));

    dbManager.insertUserLevelData(userLevelData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.addUserData = function (req, res) {
    var userData = JSON.parse(JSON.stringify(req.body));

    dbManager.insertUserData(userData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.addNoticeData = function (req, res) {
    var noticeData = JSON.parse(JSON.stringify(req.body));
    
    dbManager.insertNoticeData(noticeData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    })
}

module.exports.addNoticeUserReadData = function (req, res) {
    var noticeUserReadData = JSON.parse(JSON.stringify(req.body));
    
    dbManager.insertNoticeUserReadData(noticeUserReadData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    })
}

module.exports.updateUserData = function (req, res) {
    var userData = JSON.parse(JSON.stringify(req.body));

    dbManager.updateUserData(userData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.updateNoticeData = function (req, res) {
    var noticeData = JSON.parse(JSON.stringify(req.body));

    dbManager.updateNoticeData(noticeData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getLoginData = function (req, res) {
    var logInData = JSON.parse(JSON.stringify(req.query));
    
    dbManager.findUserData(logInData, function (result, err, user) {
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
    var usersData = JSON.parse(JSON.stringify(req.query));
  
    dbManager.findUsersData(usersData, function (result, err, users) {
        if (result) {
            var userArray = [];
            for (var index in users) {

                var pmsUserInfo = {};
                pmsUserInfo.UserIndex = Number(usersData.pageSizeValue * usersData.pageIndexValue) + Number(index);
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
    var noticesDataNewCount = JSON.parse(JSON.stringify(req.query));
    
    dbManager.findNoticesDataNewCount(noticesDataNewCount, function (result, err, count) {
        if (result) {
            res.send({ 'Count': count });
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getNoticesData = function (req, res) {
    var noticesData = JSON.parse(JSON.stringify(req.query));
  
    dbManager.findNoticesData(noticesData, function (result, err, notices) {
        if (result) {
            var noticeArray = [];

            for (var index in notices) {
                var currentDate = convertDateToString(new Date());
                var noticeDate = convertDateToString(notices[index].StartDate);

                var pmsNoticeInfo = {};
                pmsNoticeInfo.NoticeId = notices[index].id;
                pmsNoticeInfo.NoticeTitle = notices[index].Title;
                pmsNoticeInfo.NoticeWriter = notices[index].Writer;
                pmsNoticeInfo.NoticeDate = notices[index].StartDate;
                pmsNoticeInfo.NoticeOption = notices[index].Option;
                pmsNoticeInfo.NoticeContent = notices[index].Content;
                pmsNoticeInfo.NoticeEndDate = notices[index].EndDate;
                pmsNoticeInfo.NoticeIndex = Number(noticesData.pageSizeValue * noticesData.pageIndexValue) + Number(index);

                pmsNoticeInfo.NoticeRead = false;
                for (var readIndex in notices[index].ReadInfo) {
                    if (notices[index].ReadInfo[readIndex].name == noticesData.user) {
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
    var userData = JSON.parse(JSON.stringify(req.query));
    
    dbManager.deleteUserData(userData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.deleteNoticeData = function (req, res) {
    var noticeData = JSON.parse(JSON.stringify(req.query));

    dbManager.deleteNoticeData(noticeData, function (result, err) {
        if (result) {
            res.end();
        }
        else {
            res.status(505).json({ error: err });
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
}).single('ExcelFile');
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
                //res.json({ error_code: 0, err_desc: null, data: result });
                dbManager.dropMothersData();
                saveMotherDataArrayToDB(result,res);
                //res.redirect('..');
                res.end();
            });
        } catch (e) {
            res.json({ error_code: 1, err_desc: "Corupted excel file" });
        }
    })
}
saveMotherDataArrayToDB = function (result,res) {
    for (var i = 0; ((i < result.length) && result[i].코드 != ""); i++) {
        //컴버터가 필요하다. excel 양식 -> schema 양식에 맞게.
        var convertdJson = CoverteforSave(result[i]);
        //변환이 끝난 json 은 저장 
        var callback = function (result, err) {
            if (result) {
                res.end();
            }
            else/*(result == 0) */ {
                res.status(500).json({ error: err });
            }
        }
        dbManager.ImportMotherData(convertdJson, callback);
        //  if (true != result) 비동기라 undefind 가 넘어와서 종료됨. 리턴값 무시 
        //      return result;  
    }
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

module.exports.DisplayGridMotherdata = function (req, res) {
    //mother data를 가져온다.
    //debug console.log("Display 함수 호출");
    //getMothersData를 가져올 때 결과 처리 함수.
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            
            res.status(500).json({ error: err });
        }
    }
    dbManager.getMothersAllData(callback);
}

/* Calendar API Start **********************************************/
module.exports.getMemoInfo = function (req, res) {

    var param = {
        targetDate: req.query.TargetDate
    };

    dbManager.getMemoInfo(param, function (result, memoInfo) {
        if (result == true) {
            res.json(memoInfo);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getMemoInfoList = function (req, res) {

    var param = req.query.month;

    dbManager.getMemoInfoList(param, function (result, memoInfoList) {
        if (result == true) {
            res.json(memoInfoList);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getEventGroupList = function (req, res) {

    var param = req.query.month;

    dbManager.getEventGroupList(param, function (result, eventGroupList) {
        if (result == true) {
            res.json(eventGroupList);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getEventList = function (req, res) {

    var param = {
        targetDate: req.query.TargetDate,
        groupType: req.query.GroupType
    };

    dbManager.getEventList(param, function (result, eventList) {
        if (result == true) {
            res.json(eventList);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.updateEventGroupSchedule = function (req, res) {

    var param = JSON.parse(JSON.stringify(req.body));    

    dbManager.updateEventGroupSchedule(param, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.updateEventsSchedule = function (req, res) {

    var param = JSON.parse(JSON.stringify(req.body));

    dbManager.updateEventsSchedule(param, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}
/* Calendar API End ************************************************/

module.exports.getmotheronedata = function (req, res) {
    console.log("api 핸들러에 들어옴", req.query.Code);

    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.getMothersoneData(callback, req.query.Code);
}
module.exports.savemother = function (req, res) {
    console.log("api 핸들러 savemother");
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            console.log("여기야?");
            res.status(500).json({ error: err });
        }
    }

    dbManager.saveMothersoneData(callback, req);
}
module.exports.createmother = function (req, res) {
    console.log("api 핸들러 createmother");
    var callback = function (result, err) {
        if (result) {
            res.end();
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    var motherdata = JSON.parse(JSON.stringify(req.body));
    dbManager.CreateMotherData(motherdata, callback);

}
module.exports.getcode = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.getcodeList(callback);
}
module.exports.deletemother = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.deletemotherdata(callback, req.query.Code);
} 