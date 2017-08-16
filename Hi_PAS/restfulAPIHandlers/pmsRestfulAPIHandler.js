/* PMS Restful API Handler */
var util = require('util');
var dbManager = require('../utility/dbManager/pmsDBManager');
var pmsUserInfo = require('../models/pms/userInfoData.json');
var MaintItemData = require('../models/pms/MaintItemData.json');
var todoDataSet = require('../models/pms/TodoDataSet.json');
var async = require('async');
var multer = require('multer')
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var localeUtil = require('../utility/localeUtil');
var TBMDateUnit = {
    Total: 0,
    Day: 1,
    Week: 2, 
    Month: 3
}
var weekString = [{ Day: 1, Week: 'Mon' },
    { Day: 2, Week: 'Tue' },
    { Day: 3, Week: 'Wed' },
    { Day: 4, Week: 'Thu' },
    { Day: 5, Week: 'Fri' },
    { Day: 6, Week: 'Sat' },
    { Day: 7, Week: 'Sun'}];

var fileupload = multer({ storage: multer.memoryStorage() }).single('file');

module.exports.getTodoFileListData = function (req, res) {
    var fileData = JSON.parse(JSON.stringify(req.query));

    dbManager.findTodoFileListData(fileData, function (result, err, files) {
        if (result) {
            res.send({ files: files });
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.getTodoFileRawData = function (req, res) {
    var fileData = JSON.parse(JSON.stringify(req.query));

    dbManager.findTodoFileRawData(fileData, function (result, err, store) {
        if (result) {
            res.header("Content-Type", store.contentType);
            store.stream(true).pipe(res);
        }
        else {
            res.status(505).json({ error: err });
        }
    });
}

module.exports.addTodoFileData = function (req, res) {
    fileupload(req, res, function (err) {
        if (err) {
            res.status(505).json({ error: err });
            return;
        }

        var param = {};
        param.file = req.file;
        param.toDoUID = req.body.ToDoUID;
        param.fileWriter = req.body.FileWriter;

        async.waterfall([
            function (callback) {
                /* Add ToDo File List  */
                dbManager.insertTodoFileListData(param, function (result, err, fileInfo) {
                    if (result) {
                        param.fileInfo = fileInfo;
                        callback(null);
                    }
                    else {
                        callback(err);
                    }
                });
            },
            function (callback) {
                /* Add Todo File RawData */
                dbManager.insertTodoFileRawData(param, function (result, err) {
                    if (result == null) {
                        callback(null);
                    }
                    else {
                        callback(err);
                    }
                });
            },
        ], function (err) {
            if (err) {
                res.status(505).json({ error: err });
            }
            res.send(param.fileInfo);
        });
    });
}

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

                MotherDataArrayToDB(result, res);
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
    var result = MaintItemData;
    result.Code = rawjson.코드;
    result.Title = rawjson.제목;
    result.Content = rawjson.내용;
    result.DeviceType = rawjson.대분류;/* PMSDeviceTypeSchema UID */ 
  //  result.MediumCategory = rawjson.중분류; 스키마에 없음
  //  result.SmallCategory = rawjson.소분류;       "
    result.CreateDate = Date();
    result.CheckType = rawjson.주기;/* 0 == TBM, 1 == CBM */
    result.TBMCheckUnit = rawjson.시간단위;/* PMSTBMCheckUnitTypeSchema UID,  0 : Daily, 1 : Weekly, 2 : Monthly */
    result.TBMCheckValue = rawjson.value1; /* Weekly : 1 ~ 2 , Monthly : 1 ~ 31 */
    result.CBMCheckUnit = rawjson.거리단위;/* PMSCBMCheckUnitTypeSchema UID,  0 : Count , 1 : Distance */
    result.CBMCheckLimitValue = rawjson.value2;
    result.CBMCheckWarnLimitValue = rawjson.value3;
    result.Relation = rawjson.연관코드;
    result.Type = rawjson.유형;/* 0 : Check, 1 : Action */
    result.Level = rawjson.등급;/* PMSItemLevelType UID */
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

            dbManager.InfoLog(util.format(localeUtil.getLangString("LID_PMS_TASK_SCHEDULE_CHANGED"), "2017-07-12", "Daily"));            
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

/* History API Start ************************************************/
module.exports.getMaintHistoryList = function (req, res) {

    var param = {
        startDate: new Date(req.query.StartDate),
        endDate: new Date(req.query.EndDate).setHours(23, 59, 59, 999)
    };

    dbManager.getMaintHistoryList(param, function (result, historyList) {
        if (result == true) {
            res.json(historyList);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getSystemLogList = function (req, res) {
    
    var param = {
        startDate: new Date(req.query.StartDate),
        endDate: new Date(req.query.EndDate).setHours(23, 59, 59, 999)
    };    

    dbManager.getSystemLogList(param, function (result, logList) {
        if (result == true) {
            res.json(logList);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}
/* History API End **************************************************/


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
module.exports.getactionlistbyMacine = function (req, res) {
    var pivotmachinetype;
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
          
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.getactionlistbyMacine(callback, req.query.DeviceUID);
}

module.exports.AddactioniList = function (req, res) {
    
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else {
            res.status(500).json({ error: err });
        }
    }
    dbManager.AddactionList(callback, req.body.params.targetList, req.body.params.Code);
}
module.exports.updateitem = function (req, res) {
    console.log("api 핸들러 savemother");

    var maintItemData = JSON.parse(JSON.stringify(req.body.params));
  //  dbManager.createMaintItem(maintItemData, function (result) {

    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            console.log("여기야?");
            res.status(500).json({ error: err });
        }
    }

    dbManager.saveMothersoneData(callback, maintItemData);
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

module.exports.createfacility = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.createfacility(callback, req);
}
module.exports.createchecklist = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    for (var ch_cr_i = 0; ch_cr_i < req.body.arr.length; ch_cr_i++) {
        dbManager.createchecklist(callback, req.body.arr[ch_cr_i], req.body.Facilityid);
    }
}

module.exports.getallfacility = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.getallfacility(callback, req);
}
module.exports.getFacilityCheckData = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.getFacilityCheckData(callback, req);
}
module.exports.getModule = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            console.log('doc', doc );
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.getModule(callback, req);
}

module.exports.getMaintUID = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    
    dbManager.getmachine(callback, req);
}

module.exports.getmachine = function (req, res) {
    var callback = function (result, err, doc) {
        if (result) {
            res.send(doc);
        }
        else/*(result == 0) */ {
            res.status(500).json({ error: err });
        }
    }
    dbManager.getmachine(callback, req);
}

// Get Todo Group List
module.exports.getTodoGroupList = getTodoGroupList;
module.exports.getGroupTodoListPerDate = getGroupTodoListPerDate;
module.exports.getTodoListPerDate = getTodoListPerDate;

// Get Maint Item List
module.exports.getMaintItemList = function (req, res) {
    dbManager.getMaintItemList(function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

// Get Todo Group List
function getTodoGroupList(req, res) {
    /* XXX 
    if (!dbManager) {
        return;
    }

    dbManager.getCheckList(function (result, checkList) {
        var todoGroupList = [];
        if (result) {
            var period = {
                startDate: req.query.startDate,
                endDate: req.query.endDate
            }

            for (var checkIndex = 0; checkIndex < checkList.length; checkIndex++) {
                var checkItem = checkList[checkIndex];
                if (!checkItem) {
                    continue;
                }

                var checkDate = checkItem.CreateDate;
                var isTerminate = true;
                while (isTerminate) {
                    if (checkDate >= period.startDate && checkDate <= period.endDate) {
                        // Check Date Exist
                        var todoGroupIndex = checkExistTodoGroupDate(todoGroupList);
                        if (todoGroupIndex != -1) {
                            // Update Todo Group List
                            todoGroupList[todoGroupIndex].todoGroup
                                = getTodoGroupFlag(todoGroupList[todoGroupIndex].todoGroup,
                                checkItem.TBMCheckUnit);
                        } else {
                            // Add Todo Group List
                            todoGroupList.push({
                                CheckDate: checkDate,
                                todoGroup: getTodoGroupFlag(null, checkItem.TBMCheckUnit)
                            });
                        }

                        if (endDate < maintDate) {
                            isTerminate = false;
                        }
                    }

                    addDateOffset(checkItem.TBMCheckUnit,
                        checkItem.TimeBaseValue, maintDate);
                }
            }

            res.send(todoGroupList);
        }
        else {
            res.status(500).json({ error: err });
        }
    });
    */
}

module.exports.getMachineTypeList = function (req, res) {

    dbManager.getMachineTypeList(function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

// Get Todo List Per Group
function getGroupTodoListPerDate(req, res) {
    dbManager.getAllMachineItemDataList(function (result, checkList) {
        if (result) {
            
        }
        else {

        }
    });
} 

// Get Todo List Per Date
function getTodoListPerDate(req, res) {
    if (!dbManager) {
        return;
    }

    var selectedDate = new Date(req.query.maintDate);
    var currentDate = new Date();
    var tbmCheckUnit = req.query.tbmCheckUnit;

    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    /// Get Past and Today Todo List - From DB
    todoDataSet.MaintDate = selectedDate;
    if (selectedDate <= currentDate) {
        dbManager.getTodoDataListByDate(selectedDate, tbmCheckUnit, function (err, todoItemList) {
            if (err) {
                res.status(505).json({ error: err });
                return;
            }

            todoDataSet.TodoDataList = todoItemList;
            res.send(todoDataSet);
        });

    } else {
        /// Get Future Check List - From Check List
        dbManager.getTodoDataListByMachineItemData(selectedDate, tbmCheckUnit, function (err, todoItemList) {
            if (err) {
                res.status(505).json({ error: err });
                return;
            }

            todoDataSet.TodoDataList = todoItemList;
            res.send(todoDataSet);
        });
    }
}

// Make Period String
function makePeriodString(TBMCheckUnit, TBMCheckValue) {
    var periodString = "None";
    switch (TBMCheckUnit) {
        case TBMDateUnit.Day:
            periodString = TBMCheckValue + " Day";
            break;

        case TBMDateUnit.Week:
            for (var index = 0; index < weekString.length; index++) {
                if (weekString[index].Day == TBMCheckValue) {
                    periodString = weekString[index].Week + " of every week";
                    break;
                }
            }
            break;

        case TBMDateUnit.Month:
            periodString = TBMCheckValue + "th of every month";
            break;
    }

    return periodString;
}

function makeTodoStatusString(todoItem) {
    if (!todoItem || todoItem.Status == 0) {
        return "미점검";
    } 

    if (todoItem.CheckResult == 1) {
        return "미조치";
    }

    return "완료";
}

function makeTodoLevelString(levelUID, maintItemLevelTypeList) {
    for (var index = 0; index < maintItemLevelTypeList.length; index++) {
        if (levelUID == maintItemLevelTypeList[index].UID) {
            return maintItemLevelTypeList[index].Name;
        }
    }

    return null;
}

function getTypeName(deviceType, typeList) {
    for (var index = 0; index < typeList.length; index++) {
        if (deviceType == typeList[index].DeviceType) {
            return typeList[index];
        }
    }

    return null;
}

// Get Todo Group Flag
function getTodoGroupFlag(todoGroupFlag, TBMCheckUnit) {
    if (!todoGroupFlag) {
        todoGroupFlag = {
            DayTodo: false,
            WeekTodo: false,
            MonthTodo: false
        }
    }

    switch (TBMCheckUnit) {
        case TBMDateUnit.Day:
            todoGroupFlag.DayTodo = true;
            break;

        case TBMDateUnit.Week:
            todoGroupFlag.WeekTodo = true;
            break;

        case TBMDateUnit.Month:
            todoGroupFlag.MonthTodo = true;
            break;
    }

    return todoGroupFlag;
}

// Check Exist Todo Group Date
function checkExistTodoGroupDate(todoGroupList) {
    for (var todoGroupIndex = 0;
        todoGroupIndex < todoGroupList.length;
        todoGroupIndex++) {
        if (todoGroupList[todoGroupIndex].CheckDate
            == checkDate) {
            return todoGroupIndex;
        }
    }

    return -1;
}

// Add Date OffsetTBMCheckUnit
function addDateOffset(TBMCheckUnit, TBMCheckValue, maintDate) {
    /* XXX 추후 수정 필요 */
    switch (TBMCheckUnit) {
        case TBMDateUnit.Day:
            maintDate.setDate(maintDate.getDate() + TBMCheckValue);
            break;

        case TBMDateUnit.Week:
            var dateOffset = 7;
            var maintDay = maintDate.getDay();
            if (maintDay < TBMCheckValue) {
                dateOffset = TBMCheckValue - maintDay;
            } else if (maintDay > TBMCheckValue){
                dateOffset = 7 - (maintDay - TBMCheckValue);
            }

            maintDate.setDate(maintDate.getDate() + dateOffset);
            break;

        case TBMDateUnit.Month:
            maintDate.setDate(maintDate.getDate() + 1);
            break;
    }
}

module.exports.getModuleTypeList = function (req, res) {

    var param = {
        MachineType: req.query.MachineType
    };

    dbManager.getModuleTypeList(param, function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getDeviceTypeList = function (req, res) {

    var param = {
        MachineType: req.query.MachineType,
        ModuleType: req.query.ModuleType
    };

    dbManager.getDeviceTypeList(param, function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getMaintItemLevelList = function (req, res) {

    dbManager.getMaintItemLevelList(function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getTBMCheckUnitList = function (req, res) {

    dbManager.getTBMCheckUnitList(function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.getCBMCheckUnitList = function (req, res) {

    dbManager.getCBMCheckUnitList(function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}


module.exports.createMaintItem = function (req, res) {

    var maintItemData = JSON.parse(JSON.stringify(req.body.params));

    dbManager.createMaintItem(maintItemData, function (result) {
        if (result == true) {
            res.end();
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

/* Machine Maint Item API *************************************/
module.exports.getMachineMaintItemList = function (req, res) {

    var param = {
        MachineType: req.query.MachineType,
        MachineID: req.query.MachineID
    };

    dbManager.getMachineMaintItemList(param, function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.addMachineMaintItem = function (req, res) {

    var machineItemList = JSON.parse(JSON.stringify(req.body.params));

    dbManager.addMachineMaintItem(machineItemList, function (result, list) {
        if (result == true) {
            res.json(list);
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

module.exports.removeMachineMaintItem = function (req, res) {

    var machineItemList = JSON.parse(JSON.stringify(req.body.params));

    dbManager.removeMachineMaintItem(machineItemList, function (result) {
        if (result == true) {
            res.end()
        }
        else {
            res.status(505).json({ error: "Internal Error" });
        }
    });
}

