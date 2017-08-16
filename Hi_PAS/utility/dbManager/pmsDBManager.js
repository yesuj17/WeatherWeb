require('date-utils');
var mongoose = require('mongoose');
var async = require('async');
var UserInfoSchema = require('../../models/dbSchema/UserInfoSchema.js');
var NoticeInfoSchema = require('../../models/dbSchema/NoticeInfoSchema.js');
var UserLevelSchema = require('../../models/dbSchema/UserLevelSchema.js');
var PMSSystemLogDataSchema = require('../../models/dbSchema/PMSSystemLogDataSchema.js');
var PMSMaintHistoryDataSchema = require('../../models/dbSchema/PMSMaintHistoryDataSchema.js');
var CheckListSchema = require('../../models/dbSchema/CheckListSchema.js');
var TodoListSchema = require('../../models/dbSchema/TodoListSchema.js');
var PmsFacilitysSchema = require('../../models/dbSchema/PmsFacilitysSchema.js');
var localeUtil = require('../../utility/localeUtil');

var PMSMachineTypeSchema = require('../../models/dbSchema/PMSMachineTypeSchema.js');
var PMSModuleTypeSchema = require('../../models/dbSchema/PMSModuleTypeSchema.js');
var PMSDeviceTypeSchema = require('../../models/dbSchema/PMSDeviceTypeSchema.js');
var PMSTBMCheckUnitTypeSchema = require('../../models/dbSchema/PMSTBMCheckUnitTypeSchema.js');
var PMSCBMCheckUnitTypeSchema = require('../../models/dbSchema/PMSCBMCheckUnitTypeSchema.js');
var PMSMaintItemLevelTypeSchema = require('../../models/dbSchema/PMSMaintItemLevelTypeSchema.js');
var PMSMaintItemDataSchema = require('../../models/dbSchema/PMSMaintItemDataSchema.js');
var PMSMachineItemDataSchema = require('../../models/dbSchema/PMSMachineItemDataSchema.js');
var PMSTodoDataSchema = require('../../models/dbSchema/PMSToDoDataSchema.js');

var PMSFileDataSchema = require('../../models/dbSchema/PMSFileDataSchema.js');
var PMSMemoDataSchema = require('../../models/dbSchema/PMSMemoDataSchema.js');

var GridStore = mongoose.mongo.GridStore;
module.exports.getAllMachineItemDataList = getAllMachineItemDataList;
module.exports.getTodoDataListByDate = getTodoDataListByDate;
module.exports.getTodoDataListByMachineItemData = getTodoDataListByMachineItemData;
module.exports.addTodoItem = addTodoItem;

//PMSMaintItemDataSchema.find().select().exec(function (err, doc) {
//    if (err) {
//        console.err(err);
//        next(false, err, doc/* doc : null */)//err발생.
//    }
//    next(true, err/* err: null */, doc); //정상처리
//});

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
    { Day: 7, Week: 'Sun' }];

module.exports.findTodoFileListData = function(param, next){
    if(!param){
        next(false, 'param null');
        return;
    }

    var query = PMSFileDataSchema
        .find()
        .where('ToDoUID').equals(Number(param.ToDoUID));

    query.exec(function (err, files) {
        if (err) {
            next(false, err);
            return;
        }

        if (!files) {
            next(false, 'files null');
        }

        next(true, '', files);
    });
}

module.exports.findTodoFileRawData = function(param, next){
    if(!param){
        next(false, 'param null');
        return;
    }

    var db = mongoose.connection.db;
    var option = {};   
    option.root = 'RawTodoFile';    
    option.metadata = {};

    var store = new GridStore(db, Number(param.fileId), Number(param.fileId), "r", {root: option.root});
	store.open(function(err, store) {
		if (err) {
            console.log('findGridFile ERROR ===================');
            next(false, err);
            return;
		}
        
        next(true, '', store);
	});
}

module.exports.insertTodoFileListData = function(param, next){
    if(!param){
        next(false, 'param null');
        return;
    }

    var data = new PMSFileDataSchema();
    data.ToDoUID = param.toDoUID;
    data.FileName = param.file.originalname;
    data.FileType = (param.file.mimetype == 'image/png' || param.file.mimetype == 'image/jpeg') ? 0 : 1;
    data.FileWriter = param.fileWriter;

    data.save(function (err) {
        if (err) {
            next(false, err);
            return;
        }
        next(true, '', data);
    });
}

module.exports.insertTodoFileRawData = function(param, next){
    if(!param){
        next(false, 'param null');
        return;
    }

    var db = mongoose.connection.db;
    var fileName = param.file.originalname;
    var fileType = param.file.mimetype;
    var fileBuffer = param.file.buffer;
    var UID = param.fileInfo.UID;
    
    var option = {};
    option.root = 'RawTodoFile'; 
    option.metadata = {};
    option.content_type = fileType;

    new GridStore(db, UID, fileName, "w", option).open(function(err, file){
        if (err) {
            return next(err);
        }
        else {
            file.write(fileBuffer, true, next);
        }
	});
}

// Insert to Mongo DB
module.exports.insertUserLevelData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }

    var key = 'Level';
    var query = UserLevelSchema
        .findOne()
        .where(key).equals(param.level);

    query.exec(function (err, userLevel) {
        if (err) {
            next(false, err);
            return;
        }

        if (userLevel) {
            next(false, 'level exist');
            return;
        }

        userLevel = new UserLevelSchema();
        userLevel.Level = param.level;
        userLevel.LevelName = param.levelName;

        userLevel.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

module.exports.insertUserData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    var key = 'UserName';
    var query = UserInfoSchema
        .findOne()
        .where(key).equals(param.userName);

    query.exec(function (err, user) {
        if (err) {
            next(false, err);
            return;
        }

        if (user) {
            next(false, 'duplicate');
            return;
        }

        user = new UserInfoSchema();
        user.UserName = param.userName;
        user.UserEmail = param.userEmail;
        user.UserPhone = param.userPhone;

        user.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

module.exports.insertNoticeData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }

    var notice = new NoticeInfoSchema();
    notice.Title = param.NoticeTitle;
    notice.Content = param.NoticeContent;
    notice.Writer = param.NoticeWriter;
    notice.Option = param.NoticeOption
    notice.StartDate = Date.now();
    notice.EndDate = param.NoticeEndDate;

    notice.save(function (err) {
        if (err) {
            next(false, err);
            return;
        }
        next(true);
    })
}

module.exports.insertNoticeUserReadData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    var key = '_id';
    var query = NoticeInfoSchema
        .findOne()
        .where(key).equals(param.noticeId);

    query.exec(function (err, notice) {
        if (err) {
            next(false, err);
            return;
        }

        if (!notice) {
            next(false, 'notice null');
            return;
        }

        notice.ReadInfo.push({ name: param.noticeReadUser });
        notice.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

// Update to Mongo DB
module.exports.updateUserData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    var key = 'UserName';
    var query = UserInfoSchema
        .findOne()
        .where(key).equals(param.userName);

    query.exec(function (err, user) {
        if (err) {
            next(false, err);
            return;
        }

        if (!user) {
            next(false, 'user null');
            return;
        }

        user.UserEmail = param.userEmail;
        user.UserPhone = param.userPhone;

        user.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

module.exports.updateNoticeData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }

    var key = '_id';
    var query = NoticeInfoSchema
        .findOne()
        .where(key).equals(param.NoticeId);

    query.exec(function (err, notice) {
        if (err) {
            next(false, err);
            return;
        }

        if (!notice) {
            next(false, 'notice null');
            return;
        }

        notice.Title = param.NoticeTitle;
        notice.Content = param.NoticeContent;
        notice.Writer = param.NoticeWriter;
        notice.Option = param.NoticeOption
        notice.StartDate = Date.now();
        notice.EndDate = param.NoticeEndDate;

        notice.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

// Select from Mongo DB
module.exports.findUserData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }

    var query = UserInfoSchema
        .findOne()
        .where('UserName').equals(param.UserName);

    query.exec(function (err, user) {
        if (err) {
            next(false, err);
            return;
        }

        if (!user) {
            next(false, 'user null');
            return;
        }

        next(true, '', user);
    });
}

module.exports.findUsersData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    // make search query
    var filter = param.filterValue;
    var search = '.*' + param.searchValue + '.*';
    var size = Number(param.pageSizeValue);
    var index = Number(param.pageSizeValue * param.pageIndexValue);

    var query = UserInfoSchema
        .find()
        .where(filter).regex(search)
        .skip(index)
        .limit(size);

    query.exec(function (err, user) {
        if (err) {
            next(false, err);
            return;
        }

        if (!user) {
            next(false, 'user null');
        }

        next(true, '', user);
    });
}

module.exports.findNoticesDataNewCount = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }

    var tempDay = new Date();
    var strDay = tempDay.getFullYear() + '-' + (tempDay.getMonth() + 1) + '-' + tempDay.getDate();
    var toDay = new Date(strDay);

    var query = NoticeInfoSchema
        .find()
        .where('EndDate').gte(toDay)
        .where('ReadInfo.name')
        .nin(param.userValue)
        .count();

    query.exec(function (err, count) {
        if (err) {
            next(false, err);
            return;
        }
        next(true, '', count);
    });
}

module.exports.findNoticesData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    // make search query
    var filter = param.filterValue;
    var search = '.*' + param.searchValue + '.*';
    var size = Number(param.pageSizeValue);
    var index = Number(param.pageSizeValue * param.pageIndexValue);

    var tempDay = new Date();
    var strDay = tempDay.getFullYear() + '-' + (tempDay.getMonth() + 1) + '-' + tempDay.getDate();
    var toDay = new Date(strDay);

    var query = NoticeInfoSchema
        .find()
        .where(filter).regex(search)
        .where('EndDate').gte(toDay)
        .skip(index)
        .limit(size)
        .sort({ Option: -1, StartDate: -1 });

    query.exec(function (err, notice) {
        if (err) {
            next(false, err);
            return;
        }

        if (!notice) {
            next(false, 'notice null');
        }

        next(true, '', notice);
    });
}

// Delete from Mongo DB
module.exports.deleteUserData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    var key = 'UserName';
    var query = UserInfoSchema
        .findOne()
        .where(key).equals(param.userName);

    query.exec(function (err, user) {
        if (err) {
            next(false, err);
            return;
        }

        if (!user) {
            next(false, 'user null');
            return;
        }

        user.remove(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

module.exports.deleteNoticeData = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    var key = '_id';
    var query = NoticeInfoSchema
        .findOne()
        .where(key).equals(param.NoticeId);

    query.exec(function (err, notice) {
        if (err) {
            next(false, err);
            return;
        }

        if (!notice) {
            next(false, 'notice null');
            return;
        }

        notice.remove(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

module.exports.CreateMotherData = function (InputmotherData, next) {
    //debug console.log("CreateMotherData 실행");
    //input data 유효성 check
    if (!InputmotherData) {
        //debug console.log(" [CreateMotherData]modeherData가 널임.");
        //  next(4, 'motherData null');
        return;
    }
    // 들어오는 input data중 동일한 data를 가져오는 쿼리( code값으로 식별)
    console.log('저장하려고', InputmotherData.Code);
    PMSMaintItemDataSchema.findOne({ Code: InputmotherData.Code }, function (err, doc) {
        if (err) {
            //debug  console.log(" [CreateMotherData]스키마에서 찾다가 에러남.");
            console.log('스키마에서 검색 하다가 에러');
            next(false, err);

            return;
        }
        //data이미 가 있으면 중복처리
        if (doc) {
            //debug  console.log(" [CreateMotherData]스키마에 이미 존재");
            console.log('스키마에서 검색 하다가 중복');
            next(false, '중복');
            return;
        }
        console.log('저장', InputmotherData.Code);
        var a = new PMSMaintItemDataSchema();
        a.Code = InputmotherData.Code;
        a.Title = InputmotherData.Title;
        a.Content = InputmotherData.Content;
        a.LargeCategory = InputmotherData.LargeCategory;
        a.MediumCategory = InputmotherData.MediumCategory;
        a.SmallCategory = InputmotherData.SmallCategory;
        a.CreateDate = new Date();//InputmotherData.CreateDate;
        a.TimeGroup = InputmotherData.TimeGroup;
        a.TimeBaseUnit = InputmotherData.TimeBaseUnit;
        a.TimeBaseValue = InputmotherData.TimeBaseValue;
        a.nonTimeBaseMainUnit = InputmotherData.nonTimeBaseMainUnit;
        a.nonTimeBaseMainValue = InputmotherData.nonTimeBaseMainValue;
        a.nonTimeBaseWarningUnit = InputmotherData.nonTimeBaseWarningUnit;
        a.nonTimeBaseWarningValue = InputmotherData.nonTimeBaseWarningValue;
        if (InputmotherData.Relation != undefined)
            a.Relation = InputmotherData.Relation.split(',');
        a.Type = InputmotherData.Type;
        a.Level = InputmotherData.Level;

        a.save(function (err) {
            if (err) {
                next(false, err);
                //debug  console.log(" [CreateMotherData]model 저장실패");
                //  next(5, 'fail save');
                return;
            } else {
                //debug  console.log(" [CreateMotherData]model 저장 성공");
                next(true, '');
            }
        });
    });
    //db에 input 하려는 데이터가 없을 때 새로 생성. 
}
module.exports.ImportMotherData = function (InputmotherData, next) {
    //debug console.log("CreateMotherData 실행");
    //input data 유효성 check
    if (!InputmotherData) {
        //debug console.log(" [CreateMotherData]modeherData가 널임.");
        //  next(4, 'motherData null');
        return;
    }
    // 들어오는 input data중 동일한 data를 가져오는 쿼리( code값으로 식별)
    console.log('저장하려고', InputmotherData.Code);
    console.log('저장', InputmotherData.Code);
    var a = new PMSMaintItemDataSchema();
    a.Code = InputmotherData.Code;
    a.Title = InputmotherData.Title;
    a.Content = InputmotherData.Content;
    a.DeviceType = InputmotherData.DeviceType;
   // a.MediumCategory = InputmotherData.MediumCategory;
   // a.SmallCategory = InputmotherData.SmallCategory;
    a.CreateDate = new Date();//InputmotherData.CreateDate;
    a.CheckType = InputmotherData.CheckType;
    a.TBMCheckUnit = InputmotherData.TBMCheckUnit;
    a.TBMCheckValue = InputmotherData.TBMCheckValue;
    a.CBMCheckUnit = InputmotherData.CBMCheckUnit;
    a.CBMCheckLimitValue = InputmotherData.CBMCheckLimitValue;
   // a.nonTimeBaseWarningUnit = InputmotherData.nonTimeBaseWarningUnit;
    a.CBMCheckWarnLimitValue = InputmotherData.CBMCheckWarnLimitValue;
    if (InputmotherData.Relation != undefined)
        a.Relation = InputmotherData.Relation.split(',');
    a.Type = InputmotherData.Type;
    a.Level = InputmotherData.Level;

    a.save(function (err) {
        if (err) {
            next(false, err);
            console.log(" [CreateMotherData]model 저장실패",err);
            //  next(5, 'fail save');
            return;
        } else {
            console.log(" [CreateMotherData]model 저장 성공");
            next(true, '');
        }
    });
    //db에 input 하려는 데이터가 없을 때 새로 생성. 

}

/* Calendar API Start **********************************************/
module.exports.getMemoInfoList = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }

    // XXX  test code. will be removed.
    var memoInfoList = [];
    for (var i = 1; i < 31; i++) {
        var memoDate = new Date().toFormat('YYYY-MM') + '-' + ((i < 10) ? ('0' + i) : i);

        if (Math.floor(Math.random() * 1000) % 5 == 0) {
            memoInfoList.push({
                Date: memoDate,
                Exist: 'true'
            });
        }
        else {
            memoInfoList.push({
                Date: memoDate,
                Exist: 'false'
            });
        }
    }  

    next(true, memoInfoList);
}

module.exports.getMemoInfo = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }

    /* XXX  test code. will be removed. */
    var infos = [];
    infos.push({
        User : '정영도',
        Code : 'PM0005',
        TimeStamp: param.targetDate + '-04:04:05',
        Memo: '오일 누수 발생'        
    });
    infos.push({
        User: '김윤재',
        Code: 'PM0005',
        TimeStamp: param.targetDate + '-07:07:07',
        Memo: '오일 누수 해결'
    });
    infos.push({
        User: '추성호',
        Code: 'PM0323',
        TimeStamp: param.targetDate + '-17:02:05',
        Memo: '부품 변경함'
    });
    infos.push({
        User: '정영도',
        Code: 'PM0105',
        TimeStamp: param.targetDate + '-12:04:05',
        Memo: '에러 발생'
    });
    infos.push({
        User: '정영도',
        Code: 'PM0105',
        TimeStamp: param.targetDate + '-13:04:05',
        Memo: '작업자 조치 필요'
    });
    infos.push({
        User: '정영도',
        Code: 'PM0105',
        TimeStamp: param.targetDate + '-15:04:05',
        Memo: '점검 확인 하였으나 미 해결'
    });

    var memoInfo = {
        Date: param.targetDate,
        Infos: infos
    }

    next(true, memoInfo);
}

module.exports.getEventGroupList = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;    
    }

    // XXX  test code. will be removed.
    var eventGroupList = [];
    for (var i = 1; i < 31; i++) {

        var eventDate = new Date().toFormat('YYYY-MM') + '-' + ((i < 10) ? ('0' + i) : i);
        eventGroupList.push({
            Date: eventDate,
            GroupType: 'daily',
            ExistMemo: 'false'
        });  

        if (i % 7 == 3) {

            eventGroupList.push({
                Date: eventDate,
                GroupType: 'weekly',
                ExistMemo: 'true'
            });              
        }

        if (i == 17) {

            eventGroupList.push({
                Date: eventDate,
                GroupType: 'monthly',
                ExistMemo: 'false'
            });  
        }     
    }    

    next(true, eventGroupList);
}

module.exports.getEventList = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }
    
    /* XXX  test code. will be removed. */
    var eventList = [];
    for (var i = 1; i < 9; i++) {
       
        eventList.push({
            UID: "10000" + i,
            Code: "PM" + Math.floor((Math.random() * (9999 - 1000)) + 1000),
            Title: 'Task Task Task Task Task'
        });
    }  

    next(true, eventList);
}

module.exports.updateEventGroupSchedule = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }

    /* XXX not Implemented yet */

    console.log(param);

    next(true);
}

module.exports.updateEventsSchedule = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }

    /* XXX not Implemented yet */

    console.log(param);

    next(true);
}
/* Calendar API End ************************************************/

/* History & Log API Start ************************************************/
module.exports.ErrorLog = function (message) {
     
    var logData = new PMSSystemLogDataSchema();

    logData.TimeStamp = Date.now();
    logData.LogType = "Error";    
    logData.Message = message;    

    logData.save(function (err) {
        if (err) {
            console.log(err);            
        }
    });
}

module.exports.InfoLog = function (message) {

    var logData = new PMSSystemLogDataSchema();

    logData.TimeStamp = Date.now();
    logData.LogType = "Info";
    logData.Message = message;

    logData.save(function (err) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports.getSystemLogList = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }
        
    PMSSystemLogDataSchema.
        find().
        where("TimeStamp").gte(param.startDate).
        where("TimeStamp").lte(param.endDate).        
        sort('TimeStamp').
        lean().
        exec(function (err, logList) {
            if (err) {
                next(err);
                return;
            }

            next(true, logList);
            return;
        });
}

module.exports.getMaintHistoryList = function (param, next) {

    var hisList = [];

    for (var i = 0; i < 10; i++) {

        hisList.push({
            UID: i,
            UserID: "홍길동",
            TimeStamp: Date.now(),
            Code: "PM033",
            Title: "오일게이지",
            Status: "점검완료",
            MachineName : "SC1"
        });
    }

    next(true, hisList);    


    /*
    if (!param) {
        next(false, 'param null');
        return;
    }

    PMSMaintHistoryDataSchema.
        find().
        where("TimeStamp").gte(param.startDate).
        where("TimeStamp").lte(param.endDate).
        sort('TimeStamp').
        lean().
        exec(function (err, historyList) {
            if (err) {
                next(err);
                return;
            }

            next(true, historyList);
            return;
        });

    */
}


module.exports.addMaintHistory = function (machineID, code, title, status, actionStatus, msg) {

    var data = new PMSMaintHistoryDataSchema();

    dataData.TimeStamp = Date.now();
    dataData.MachineID = machineID;
    dataData.Code = code;
    dataData.Title = title;
    dataData.Status = status;
    dataData.ActionStatus = actionStatus;
    dataData.Message = msg;

    dataData.save(function (err) {
        if (err) {
            console.log(err);
        }
    });
}
/* History & Log API End **************************************************/

module.exports.InitPMSDB = function (next) {
    var defaultUserData         =   { UserName: 'Admin', UserLevel: 'Admin' };
    var defaultUserLevelData    = [ { LevelName: 'Operator' },
                                    { LevelName: 'Admin' },
                                    { LevelName: 'CSEngineer' }];
   
    async.waterfall([
        // default User Data
        function (callback) {
            onDefaultUserData(defaultUserData, function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init DefaultUserData failed');
                }
            });
        },
        // default User Level Data
        function (callback) {
            onDefaultUserLevelData(defaultUserLevelData, function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init DefaultUserLevelData failed');
                }
            });
        },
        function (callback) {
            onDefaultPMSMachineType(function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init Default PMS Machine Type failed');
                }
            });
        },
        function (callback) {
            onDefaultPMSModuleType(function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init Default PMS Module Type failed');
                }
            });
        },
        function (callback) {
            onDefaultPMSDeviceType(function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init Default PMS Device Type failed');
                }
            });
        },
        function (callback) {
            onDefaultPMSMaintItemLevelType(function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init Default PMS Device Type failed');
                }
            });
        },
        function (callback) {
            onDefaultPMSTBMCheckUnitType(function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init Default PMS Device Type failed');
                }
            });
        },
        function (callback) {
            onDefaultPMSCBMCheckUnitType(function (result) {
                if (result) {
                    callback(null);
                }
                else {
                    callback('Init Default PMS Device Type failed');
                }
            });
        }
    ],
        function (err) {
            if (err) {
                next(false);
            }
            else {
                next(true);
            }
        });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize Default Data
function onDefaultUserData(param, next) {
    var query = UserInfoSchema
        .findOne()
        .where('UserLevel').equals(param.UserName);

    query.exec(function (err, user) {
        if (err) {
            next(false);
            return;
        }

        if (user) {
            next(true);
            return;
        }

        user = new UserInfoSchema();
        user.UserName = param.UserName;
        user.UserLevel = param.UserLevel;
        user.save(function (err) {
            if (err) {
                next(false);
                return;
            }

            next(true);
        });
    });
}

function onDefaultUserLevelData(param, next) {
    mongoose.connection.db.listCollections({ name: 'userlevelschemas' })
        .next(function (err, collinfo) {
            if (collinfo == null) {
                UserLevelSchema.insertMany(param, function (err) {
                    if (err) {
                        next(false);
                        return;
                    }
                    next(true);
                });
            }
            else {
                next(true);
            }
        });
}

function onDefaultPMSMachineType(next) {
    mongoose.connection.db.listCollections({ name: 'PMSMachineType' })
        .next(function (err, collinfo) {
            if (collinfo == null) {

                var dataArray = [];

                var data = new PMSMachineTypeSchema();
                data.UID = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_STACKERCRANE");
                dataArray.push(data);

                data = new PMSMachineTypeSchema();
                data.UID = 2;
                data.Name = localeUtil.getLangString("LID_COMMON_LGV");
                dataArray.push(data);

                data = new PMSMachineTypeSchema();
                data.UID = 3;
                data.Name = localeUtil.getLangString("LID_COMMON_AGV");
                dataArray.push(data);

                PMSMachineTypeSchema
                    .insertMany(dataArray, function (err) {
                        if (err) {
                            next(false);
                            return;
                        }

                        next(true);
                    });
            }
            else {
                next(true);
            }
        });
}

function onDefaultPMSModuleType(next) {
    mongoose.connection.db.listCollections({ name: 'PMSModuleType' })
        .next(function (err, collinfo) {
            if (collinfo == null) {

                var dataArray = [];

                var data = new PMSModuleTypeSchema();
                data.UID = 1;
                data.MachineType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_MOUDLE_DRIVING");
                dataArray.push(data);

                data = new PMSModuleTypeSchema();
                data.UID = 2;
                data.MachineType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_MOUDLE_UPPER_DRIVING");
                dataArray.push(data);

                data = new PMSModuleTypeSchema();
                data.UID = 3;
                data.MachineType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_MOUDLE_FORK");
                dataArray.push(data);

                data = new PMSModuleTypeSchema();
                data.UID = 4;
                data.MachineType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_MOUDLE_HOISTING");
                dataArray.push(data);

                data = new PMSModuleTypeSchema();
                data.UID = 4;
                data.MachineType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_MOUDLE_HOISTING");
                dataArray.push(data);

                PMSModuleTypeSchema
                    .insertMany(dataArray, function (err) {
                        if (err) {
                            next(false);
                            return;
                        }

                        next(true);
                    });
            }
            else {
                next(true);
            }
        });
}

function onDefaultPMSDeviceType(next) {
    mongoose.connection.db.listCollections({ name: 'PMSDeviceType' })
        .next(function (err, collinfo) {
            if (collinfo == null) {

                var dataArray = [];

                // Driving
                var data = new PMSDeviceTypeSchema();
                data.UID = 1;
                data.MachineType = 1;
                data.ModuleType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_MOTOR");
                dataArray.push(data);

                data = new PMSDeviceTypeSchema();
                data.UID = 2;
                data.MachineType = 1;
                data.ModuleType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_BREAK");
                dataArray.push(data);

                data = new PMSDeviceTypeSchema();
                data.UID = 3;
                data.MachineType = 1;
                data.ModuleType = 1;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_ROLLER");
                dataArray.push(data);

                // Upper Driving
                data = new PMSDeviceTypeSchema();
                data.UID = 4;
                data.MachineType = 1;
                data.ModuleType = 2;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_BREAK");
                dataArray.push(data);

                // Fork
                data = new PMSDeviceTypeSchema();
                data.UID = 5;
                data.MachineType = 1;
                data.ModuleType = 3;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_MOTOR");
                dataArray.push(data);

                data = new PMSDeviceTypeSchema();
                data.UID = 6;
                data.MachineType = 1;
                data.ModuleType = 3;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_BREAK");
                dataArray.push(data);

                data = new PMSDeviceTypeSchema();
                data.UID = 7;
                data.MachineType = 1;
                data.ModuleType = 3;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_ROLLER");
                dataArray.push(data);

                // Hosting
                data = new PMSDeviceTypeSchema();
                data.UID = 8;
                data.MachineType = 1;
                data.ModuleType = 4;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_MOTOR");
                dataArray.push(data);

                data = new PMSDeviceTypeSchema();
                data.UID = 9;
                data.MachineType = 1;
                data.ModuleType = 5;
                data.Name = localeUtil.getLangString("LID_COMMON_SC_DEVICE_BREAK");
                dataArray.push(data);

                PMSDeviceTypeSchema
                    .insertMany(dataArray, function (err) {
                        if (err) {
                            next(false);
                            return;
                        }

                        next(true);
                    });
            }
            else {
                next(true);
            }
        });
}

function onDefaultPMSMaintItemLevelType(next) {
    mongoose.connection.db.listCollections({ name: 'PMSMaintItemLevelType' })
        .next(function (err, collinfo) {
            if (collinfo == null) {

                var dataArray = [];

                // Driving
                var data = new PMSMaintItemLevelTypeSchema();
                data.UID = 1;
                data.Name = localeUtil.getLangString("LID_PMS_MAINT_ITEM_LEVEL1");                
                dataArray.push(data);

                data = new PMSMaintItemLevelTypeSchema();
                data.UID = 2;
                data.Name = localeUtil.getLangString("LID_PMS_MAINT_ITEM_LEVEL2");
                dataArray.push(data);

                data = new PMSMaintItemLevelTypeSchema();
                data.UID = 3;
                data.Name = localeUtil.getLangString("LID_PMS_MAINT_ITEM_LEVEL3");
                dataArray.push(data);

                data = new PMSMaintItemLevelTypeSchema();
                data.UID = 4;
                data.Name = localeUtil.getLangString("LID_PMS_MAINT_ITEM_LEVEL9");
                dataArray.push(data);

                PMSMaintItemLevelTypeSchema
                    .insertMany(dataArray, function (err) {
                        if (err) {
                            next(false);
                            return;
                        }

                        next(true);
                    });
            }
            else {
                next(true);
            }
        });
}

function onDefaultPMSTBMCheckUnitType(next) {
    mongoose.connection.db.listCollections({ name: 'PMSTBMCheckUnitType' })
        .next(function (err, collinfo) {
            if (collinfo == null) {

                var dataArray = [];

                // Driving
                var data = new PMSTBMCheckUnitTypeSchema();
                data.UID = 1;
                data.Name = localeUtil.getLangString("LID_PMS_TBM_CHECK_UNIT_DAILY");
                dataArray.push(data);

                data = new PMSTBMCheckUnitTypeSchema();
                data.UID = 2;
                data.Name = localeUtil.getLangString("LID_PMS_TBM_CHECK_UNIT_WEEKLY");
                dataArray.push(data);

                data = new PMSTBMCheckUnitTypeSchema();
                data.UID = 3;
                data.Name = localeUtil.getLangString("LID_PMS_TBM_CHECK_UNIT_MONTHLY");
                dataArray.push(data);

                PMSTBMCheckUnitTypeSchema
                    .insertMany(dataArray, function (err) {
                        if (err) {
                            next(false);
                            return;
                        }

                        next(true);
                    });
            }
            else {
                next(true);
            }
        });
}

function onDefaultPMSCBMCheckUnitType(next) {
    mongoose.connection.db.listCollections({ name: 'PMSCBMCheckUnitType' })
        .next(function (err, collinfo) {
            if (collinfo == null) {

                var dataArray = [];

                // Driving
                var data = new PMSCBMCheckUnitTypeSchema();
                data.UID = 1;
                data.Name = localeUtil.getLangString("LID_PMS_CBM_CHECK_UNIT_COUNT");
                dataArray.push(data);

                data = new PMSCBMCheckUnitTypeSchema();
                data.UID = 2;
                data.Name = localeUtil.getLangString("LID_PMS_CBM_CHECK_UNIT_DISTANCE");
                dataArray.push(data);

                PMSCBMCheckUnitTypeSchema
                    .insertMany(dataArray, function (err) {
                        if (err) {
                            next(false);
                            return;
                        }

                        next(true);
                    });
            }
            else {
                next(true);
            }
        });
}

module.exports.dropMothersData = function () {
    console.log("MothersData Drop!");
    dropCollection(PMSMaintItemDataSchema);
    /* var promise = dropCollection(PMSMaintItemDataSchema);
    promise.then(function (text) {
        console.log(text);
    }, function (error) {
        console.log("스키마없다.");
        console.log(error);
    });*/
}
module.exports.getMothersAllData = function (next) {
    //debug console.log("getMothersAllData 실행");
    PMSMaintItemDataSchema.find().select().exec(function (err, doc) {
        if (err) {
            console.err(err);
            next(false, err, doc/* doc : null */)//err발생.
        }
        next(true, err/* err: null */, doc); //정상처리
    });
}

module.exports.getMachineUIDbyDeviceUID = function (DeviceUID) {
    return getMachineUIDbyDeviceUID(DeviceUID);
}


getMachineUIDbyDeviceUID = function(DeviceUID){
 
}

module.exports.AddactionList = function (next, targetList,Code) {
    var query = PMSMaintItemDataSchema
        .findOne()
        .where('Code')
        .equals(Code)

    PMSMaintItemDataSchema.findOne({ Code: Code }, function (err, doc) {
        if (err) {
            console.log('스키마에서 검색 하다가 에러');
            next(false, err);

            return;
        }

 
        var a = new PMSMaintItemDataSchema();
        a = doc;
        
        for (var j = 0;  doc.Relation.length; j++) {
            doc.Relation.pop();
        }
        for (var i = 0; i < targetList.length; i++) {
            doc.Relation.push(targetList[i].Code);
        }

        doc.save(function (err) {
            if (err) {
                next(false, err);
                //debug  console.log(" [CreateMotherData]model 저장실패");
                //  next(5, 'fail save');
                return;
            } else {
                //debug  console.log(" [CreateMotherData]model 저장 성공");
                next(true, '', doc.Relation);
            }
        });
    });


}
module.exports.getactionlistbyMacine = function (next, DeviceUID) {
    var temp;
    async.waterfall([
        function (callback) {
           // temp = getMachineUIDbyDeviceUID(DeviceID);
            PMSDeviceTypeSchema
                .findOne()
                .where('UID').equals(DeviceUID)
                .exec(function (err, deviceType) {
                    if (err) {
                        console.log(err);
                    }
                    callback(null, deviceType.MachineType);
                });
        },
        function (pivotmachinetype,callback) {
            var actionlist = [];
            PMSMaintItemDataSchema
                .find()
                .exec(function (err, allList) {
                if (err) {
                    console.err(err);
                }
                callback(null, pivotmachinetype, allList);//actionlist= allList;
            });
        },
        function (pivotmachinetype, actionlist, callback) {
            var i = 0;
            async.whilst(
                function () {
                    if (i == actionlist.length)
                        callback(null, actionlist);
                    return i < actionlist.length;
                },
                function (whilstcb) {
                    PMSDeviceTypeSchema
                        .findOne()
                        .where('UID').equals(actionlist[i].DeviceType)
                        .exec(function (err, deviceType) {
                            if (err) {
                                console.log(err);
                            }
                            if (pivotmachinetype != deviceType.MachineType) {
                                //대분류가 다르면 리스트에서 제외한다. 
                                actionlist.splice(i, 1);
                                console.log('ok 내부 ', i);
                                i++;
                                whilstcb(null);
                            }
                            else {
                                console.log('ng 내부 ', i);
                                i++;
                                whilstcb(null);
                            }
                        });
                    //if (i == actionlist.length - 1) {
                    //    whilstcb(null, actionlist);
                    //    console.log('외부(if) ', i);
                    //}
                   
                    console.log('외부 ', i);
                })
    
               // var targetItemMachineType = dgetMachineUIDbyDeviceUID(actionlist[i].DeviceType) ;
         //   }
          //  console.log('외부 ', i);
           
        },
        function (actionlist) {
            next(true,null,actionlist);
        }]);
    
}


module.exports.getMothersoneData = function (next, Code) {
    console.log("dbmanager에 들어옴req.param.Code:", Code);
    if (!Code) {
        next(false, 'Code null');
        return;
    }

    var query = PMSMaintItemDataSchema
        .findOne()
        .where('Code').equals(Code);

    query.exec(function (err, mother) {
        if (err) {
            next(false, err);
            return;
        }

        if (!mother) {
            next(false, 'Code null');
            return;
        }

        next(true, '', mother);
    });
    //  PMSMaintItemDataSchema.findOne().select({'Code':Code},function(err,doc){
    //      if (err) {
    //          console.err(err);
    //          next(1, err, doc/* doc : null */)//err발생.
    //      }
    //      next(0, err/* err: null */, doc); //정상처리
    //  });
}
module.exports.getcodeList = function (next) {
    //debug console.log("getMothersAllData 실행");
    PMSMaintItemDataSchema.find().select('Code').exec(function (err, doc) {
        if (err) {
            console.err(err);
            next(false, err, doc)
        }
        next(true, err, doc);
    });
}
module.exports.getallfacility = function (next) {
    PmsFacilitysSchema.find().select('FacilityId').exec(function (err, doc) {
        if (err) {
            console.err(err);
            next(false, err, doc)
        }
        next(true, err, doc);
    });
}
module.exports.createfacility = function (next, req) {
    //input data 유효성 check
    if (!req) {
        //  next(4, 'motherData null');
        return;
    }
    // 들어오는 input data중 동일한 data를 가져오는 쿼리( FacilityId값으로 식별)
    console.log('저장하려고', req.body.FacilityId);
    PmsFacilitysSchema.findOne({ Code: req.body.FacilityId }, function (err, doc) {
        if (err) {
            console.log('스키마에서 검색 하다가 에러');
            next(false, err);

            return;
        }
        //data이미 가 있으면 중복처리
        if (doc) {
            console.log('스키마에서 검색 하다가 중복');
            next(false, '중복');
            return;
        }
        console.log('저장', req.Code);
        var a = new PmsFacilitysSchema();
        a.FacilityId = req.body.FacilityId;
        a.BarCode = req.body.BarCode;

        a.save(function (err) {
            if (err) {
                next(false, err);
                //debug  console.log(" [CreateMotherData]model 저장실패");
                //  next(5, 'fail save');
                return;
            } else {
                //debug  console.log(" [CreateMotherData]model 저장 성공");
                next(true, '');
            }
        });
    });
}
module.exports.createchecklist = function (next, req, Facilityid) {
    //input data 유효성 check
    if (!req) {
        //  next(4, 'motherData null');
        return;
    }
    var keyvalue = req.Code + Facilityid;
    // 들어오는 input data중 동일한 data를 가져오는 쿼리( FacilityId값으로 식별)
    console.log('저장하려고', keyvalue);
    PMScheckSchema.findOne({ Code: keyvalue }, function (err, doc) {
        if (err) {
            console.log('스키마에서 검색 하다가 에러');
            next(false, err);

            return;
        }
        //data이미 가 있으면 중복처리
        if (doc) {
            console.log('스키마에서 검색 하다가 중복');
            next(false, '중복');
            return;
        }
        console.log('저장', keyvalue);
        var a = new PMScheckSchema();
        a.Code_FacilityId = keyvalue;
        a.CreateDate = Date();
        a.TimeGroup = req.TimeGroup;
        a.TimeBaseUnit = req.TimeBaseUnit;
        a.TimeBaseValue = req.TimeBaseValue;
        a.nonTimeVaseMainUnit = req.nonTimeVaseMainUnit;
        a.nonTimeBaseMainValue = req.nonTimeBaseMainValue;
        a.nonTimeBaseWarringUnit = req.nonTimeBaseWarringUnit;
        a.nonTimeBaseWarringValue = req.nonTimeBaseWarringValue;

        a.save(function (err) {
            if (err) {
                next(false, err);
                //debug  console.log(" [CreateMotherData]model 저장실패");
                //  next(5, 'fail save');
                return;
            } else {
                //debug  console.log(" [CreateMotherData]model 저장 성공");
                next(true, '');
            }
        });
    });
}
module.exports.getModule = function (next, req) {

    var query = PMSDeviceTypeSchema
        .findOne()
        .where('UID').equals(req.query.DeviceUID);

    query.exec(function (err, devicetype) {
        if (err) {
            next(false, err);
            return;
        }
        next(true, err, devicetype);
    });

      
    
/*
   var pipeLine = [
       {
           $lookup: {
               from: 'PMSModuleType',
               localField: 'ModuleType',
               foreignField: 'UID',
               as: 'PMSModuleTypeCol'
           }
       }];
   PMSDeviceTypeSchema.aggregate(pipeLine, function (err, datas) {
       if (err) {
           console.log(err.message);
           next(false, err, null);
       }
       for (var i = 0; i < datas.length; i++) {
           if (req.query.DeviceUID == datas[i].UID) {// 디바이스타입을 찾으면 
               next(true, err, datas[i].PMSModuleTypeCol[0]);// 디바이스 타입의 mudule uid를 반환
               //MachTypes.ModuleType = datas[i].PMSModuleTypeCol[0].UID;
               break;
           }
       }
   });
  */
 //  next(true, err, MachTypes);
}
module.exports.getmachine = function (next,req) {
    
    var pipeLine = [
        {
            $lookup: {
                from: 'PMSMachineType',
                localField: 'MachineType',
                foreignField: 'UID',
                as: 'PMSMachineTypeCol'
            }
        }];
    PMSModuleTypeSchema.aggregate(pipeLine, function (err, datas) {
        if (err) {
            console.log(err.message);
            next(false, err, null);
        }
        for (var i = 0; i < datas.length; i++) {
            if (req.query.ModuleUID == datas[i].UID) {// 모듈 타입을 찾으면 
                 next(true, err, datas[i].PMSMachineTypeCol[0]);// 디바이스 타입의 
               // MachTypes.MachineType = datas[i].PMSMachineTypeCol[0].UID;
                break;
            }
        }
    });
}


module.exports.getFacilityCheckData = function (next) {
    PMScheckSchema.find().select('FacilityId').exec(function (err, doc) {
        if (err) {
            console.err(err);
            next(false, err, doc)
        }
        next(true, err, doc);
    });
}
module.exports.deletemotherdata = function (next, Code) {

    console.log("dbmanager에 들어옴req.param.Code:", Code);
    if (!Code) {
        next(false, 'Code null');
        return;
    }

    var query = PMSMaintItemDataSchema
        .findOne()
        .where('Code').equals(Code);

    query.exec(function (err, mother) {
        if (err) {
            next(false, err);
            return;
        }

        if (!mother) {
            next(false, 'Code null');
            return;
        }

        mother.remove(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });

}
module.exports.saveMothersoneData = function (next, maintItemData) {
    console.log("dbmanager에 들어옴req.param.Code:", maintItemData.Code);
    if (!maintItemData) {
        next(false, 'data null');
        return;
    }
    var key = 'Code';
    var query = PMSMaintItemDataSchema
        .findOne()
        .where(key).equals(maintItemData.Code);

    query.exec(function (err, mother) {
        if (err) {
            next(false, err);
            return;
        }
        if (!mother) {
            next(false, 'mother null');
            return;
        }

        mother.Title = maintItemData.Title;
        mother.Content = maintItemData.Content;
        mother.DeviceType = maintItemData.DeviceType;// 소분류.
    
        mother.CheckType = maintItemData.CheckType;// 시간, 거리 
        mother.TBMCheckUnit = maintItemData.TBMCheckUnit;
     
        mother.TBMCheckValue = maintItemData.TBMCheckValue;// res에 안넘어옴

        mother.CBMCheckUnit = maintItemData.CBMCheckUnit;
        mother.CBMCheckLimitValue = maintItemData.CBMCheckLimitValue;
     
        mother.CBMCheckWarnLimitValue = maintItemData.CBMCheckWarnLimitValue;
    
       // mother.Type = req.body.Type;
        mother.Level = maintItemData.Level;

        mother.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

function dropCollection(PMSMaintItemDataSchema) {
    var collection = mongoose.connection.collections[PMSMaintItemDataSchema.collection.collectionName];
    collection.drop(function (err) {
       //debug console.log("Drop Error :",err);
    });
    // Remove mongoose's internal records of this
    // temp. model and the schema associated with it
    for (var i = 0; i < mongoose.models.length; i++) {
        if (mongoose.models[i].name == "PMSmotherSchema") {
            console.log("mongoose.models에서 PMSmotherSchema 찾음, 삭제");
            delete mongoose.models[PMSmotherSchema];
        }
        if (i == mongoose.models.length - 1)
            console.log("mongoose.models에서 PMSmotherSchema는 없음. 삭제 안해도 됨.");
    }
    for (var j = 0; j < mongoose.modelSchemas.length; j++) {
        if (mongoose.modelSchemas[j].name == "PMSmotherSchema") {
            console.log("mongoose.modelSchemas에서 PMSmotherSchema 찾음, 삭제");
            delete mongoose.modelSchemas[PMSmotherSchema];
        }
        if (j == mongoose.modelSchemas.length - 1)
            console.log("mongoose.modelSchemas에서 PMSmotherSchema는 없음. 삭제 안해도 됨.");
    }
}

// Get Check List
function getAllMachineItemDataList(next) {
    PMSMachineItemDataSchema.
            find().
            lean().
            exec(function (err, machineItemDataList) {
                if (err) {
                    next(false);
                    console.log(err);
                    return;
                }

                next(true, machineItemDataList);
                return;
            });
}

// Get Todo Data List By Date
function getTodoDataListByDate(maintDate, tbmCheckUnit, next) {
    PMSTodoDataSchema.aggregate([
        {
            $match: {
                'MaintDate': maintDate,
            }
        },
        {
            $lookup: {
                from: 'PMSMachineItemData',
                localField: 'MachineItemUID',
                foreignField: 'UID',
                as: 'MachineItemData'
            }
        },
        {
            $unwind:"$MachineItemData"
        },
        {
            $lookup: {
                from: 'PMSMaintItemData',
                localField: 'MachineItemData.MaintItemUID',
                foreignField: 'UID',
                as: 'MaintItemData'
            } 
        },
        {
            $lookup: {
                from: 'PMSMaintItemLevelType',
                localField: 'MachineItemData.Level',
                foreignField: 'UID',
                as: 'LevelType'
            }
        },
        {
            $lookup: {
                from: 'PMSDeviceType',
                localField: 'MachineItemData.DeviceType',
                foreignField: 'UID',
                as: 'DeviceType'
            }
        },
        {
            $unwind: "$DeviceType"
        },
        {
            $lookup: {
                from: 'PMSMachineType',
                localField: 'DeviceType.MachineType',
                foreignField: 'UID',
                as: 'MachineType'
            }
        },
        {
            $lookup: {
                from: 'PMSModuleType',
                localField: 'DeviceType.ModuleType',
                foreignField: 'UID',
                as: 'ModuleType'
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
            return;
        }

        var todoItemList = [];
        for (var i = 0; i < result.length; i++) {
            if ((tbmCheckUnit != TBMDateUnit.Total)
                && (tbmCheckUnit != result[i].MachineItemData.TBMCheckUnit)) {
                continue;
            }

            todoItemList.push({
                TodoID: result[i].UID,
                CheckDate: result[i].CheckDate,
                ActionDate: result[i].ActionDate,
                Status: makeTodoStatusString(result[i]),
                Level: result[i].LevelType[0].Name,
                Period: makePeriodString(result[i].MachineItemData.TBMCheckUnit,
                    result[i].MachineItemData.TBMCheckValue),
                Machine: result[i].MachineType[0].Name + result[i].MachineItemData.MachineID,
                Module: result[i].ModuleType[0].Name,
                Device: result[i].DeviceType.Name,
                Code: result[i].MaintItemData[0].Code,
                Title: result[i].MaintItemData[0].Title,
                Content: result[i].MaintItemData[0].Content
            });
        }

        next(err, todoItemList);
    });
}

// Get Todo Data List By Machine Item Data
function getTodoDataListByMachineItemData(maintDate, tbmCheckUnit, next) {
    PMSMachineItemDataSchema.aggregate([
        {
            $lookup: {
                from: 'PMSMaintItemData',
                localField: 'MaintItemUID',
                foreignField: 'UID',
                as: 'MaintItemData'
            }
        },
        {
            $lookup: {
                from: 'PMSMaintItemLevelType',
                localField: 'Level',
                foreignField: 'UID',
                as: 'LevelType'
            }
        },
        {
            $lookup: {
                from: 'PMSDeviceType',
                localField: 'DeviceType',
                foreignField: 'UID',
                as: 'DeviceType'
            }
        },
        {
            $unwind: "$DeviceType"
        },
        {
            $lookup: {
                from: 'PMSMachineType',
                localField: 'DeviceType.MachineType',
                foreignField: 'UID',
                as: 'MachineType'
            }
        },
        {
            $lookup: {
                from: 'PMSModuleType',
                localField: 'DeviceType.ModuleType',
                foreignField: 'UID',
                as: 'ModuleType'
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
            return;
        }

        var todoItemList = [];
        for (var i = 0; i < result.length; i++) {
            if ((tbmCheckUnit != TBMDateUnit.Total)
                && (tbmCheckUnit != result[i].TBMCheckUnit)) {
                continue;
            }

            var isAddTodoItem = false;
            if (result[i].TBMCheckUnit == TBMDateUnit.Month) {
                if (result[i].TBMCheckValue == maintDate.getDate()) {
                    isAddTodoItem = true;
                }
            } else if (result[i].TBMCheckUnit == TBMDateUnit.Week) {
                if (result[i].TBMCheckValue == maintDate.getDay()) {
                    isAddTodoItem = true;
                }
            } else {
                var maintStartDate = new Date(result[i].CreateDate);
                maintStartDate.setHours(0, 0, 0, 0);
                while (true) {
                    console.log(maintStartDate);
                    console.log(maintDate);
                    if (maintStartDate > maintDate) {
                        break;
                    }

                    if (maintStartDate.getTime() == maintDate.getTime()) {
                        isAddTodoItem = true;
                        break;
                    }

                    maintStartDate.setDate(maintStartDate.getDate() + result[i].TBMCheckValue);
                }
            }

            if (isAddTodoItem) {
                todoItemList.push({
                    TodoID: 0,
                    CheckDate: null,
                    ActionDate: null,
                    Status: makeTodoStatusString(),
                    Level: result[i].LevelType[0].Name,
                    Period: makePeriodString(result[i].TBMCheckUnit, result[i].TBMCheckValue),
                    Machine: result[i].MachineType[0].Name + result[i].MachineID,
                    Module: result[i].ModuleType[0].Name,
                    Device: result[i].DeviceType.Name,
                    Code: result[i].MaintItemData[0].Code,
                    Title: result[i].MaintItemData[0].Title,
                    Content: result[i].MaintItemData[0].Content
                });
            }
        }

        next(err, todoItemList);
    });
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

// Make Todo Status String
function makeTodoStatusString(todoItem) {
    if (!todoItem || todoItem.Status == 0) {
        return "미점검";
    }

    if (todoItem.CheckResult == 1) {
        return "미조치";
    }

    return "완료";
}

// Add Todo Item
function addTodoItem(maintDate, newMachineItemData, next) {
    if (!newMachineItemData) {
        next(false);
        return;
    }

    PMSTodoDataSchema.
        findOne({ MachineItemUID: newMachineItemData.UID, MaintDate: maintDate }).
        exec(function (err, todoItem) {
            if (!todoItem) {
                todoItem = new PMSTodoDataSchema();
            }

            todoItem.MaintDate = maintDate;
            todoItem.MachineItemUID = newMachineItemData.UID;
            todoItem.Status = 0;
            todoItem.CheckResult = 1;
            todoItem.ActionMaintItemUID = -1;
            todoItem.CheckDate = null;
            todoItem.ActionDate = null;
            todoItem.save(function (err) {
                if (err) {
                    console.log(err);
                    next(false);
                    return;
                }

                next(true, todoItem);
            });
        });
}

module.exports.getMaintItemList = function (next) {
    PMSMaintItemDataSchema.aggregate([
        {
            $lookup: {
                from: 'PMSMaintItemLevelType',
                localField: 'Level',
                foreignField: 'UID',
                as: 'LevelData'
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
            return;
        }

        var dataList = [];
        for (var i = 0; i < result.length; i++) {
            dataList.push({
                UID: result[i].UID,                
                Code: result[i].Code,
                Title: result[i].Title,
                DeviceType: result[i].DeviceType,                
                Level: result[i].LevelData[0].Name
            });
        }

        next(true, dataList);
    });

}

module.exports.getMachineTypeList = function (next) {

    PMSMachineTypeSchema.
        find().
        lean().
        exec(function (err, list) {
            if (err) {
                next(err);
                return;
            }

            next(true, list);
            return;
        });
}

module.exports.getModuleTypeList = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }

    PMSModuleTypeSchema.
        find().                
        where('MachineType').equals(param.MachineType).        
        exec(function (err, list) {
            if (err) {
                next(err);
                return;
            }

            next(true, list);
            return;
        });
}

module.exports.getDeviceTypeList = function (param, next) {

    if (!param) {
        next(false, 'param null');
        return;
    }

    PMSDeviceTypeSchema.
        find().
        where('MachineType').equals(param.MachineType).
        where('ModuleType').equals(param.ModuleType).
        exec(function (err, list) {
            if (err) {
                next(err);
                return;
            }

            next(true, list);
            return;
        });
}

module.exports.getMaintItemLevelList = function (next) {

    PMSMaintItemLevelTypeSchema.
        find().
        lean().
        exec(function (err, list) {
            if (err) {
                next(err);
                return;
            }

            next(true, list);
            return;
        });
}

module.exports.getTBMCheckUnitList = function (next) {

    PMSTBMCheckUnitTypeSchema.
        find().
        lean().
        exec(function (err, list) {
            if (err) {
                next(err);
                return;
            }

            next(true, list);
            return;
        });
}

module.exports.getCBMCheckUnitList = function (next) {

    PMSCBMCheckUnitTypeSchema.
        find().
        lean().
        exec(function (err, list) {
            if (err) {
                next(err);
                return;
            }

            next(true, list);
            return;
        });
}

module.exports.createMaintItem = function (maintItemData, next) {
    if (maintItemData === null) {
        next(false);
        return;
    }

    var data = new PMSMaintItemDataSchema();
    data.Code = maintItemData.Code;
    data.Title = maintItemData.Title;
    data.Content = maintItemData.Content;
    data.DeviceType = maintItemData.DeviceType;
    data.CreateDate = new Date(maintItemData.CreateDate);
    data.CheckType = maintItemData.CheckType;
    data.TBMCheckUnit = maintItemData.TBMCheckUnit;
    data.TBMCheckValue = maintItemData.TBMCheckValue;
    data.CBMCheckUnit = maintItemData.CBMCheckUnit;
    data.CBMCheckLimitValue = maintItemData.CBMCheckLimitValue;
    data.CBMCheckWarnLimitValue = maintItemData.CBMCheckWarnLimitValue;
    data.Type = maintItemData.Type;
    data.Level = maintItemData.Level;

    data.save(function (err) {
        if (err) {
            console.log(err);
            next(false);
            return;
        }

        next(true);
    });
}

module.exports.getMachineMaintItemList = function (param, next) {

    if (param === null) {
        next(false);
        return;
    }

    PMSMachineItemDataSchema.aggregate([
        {
            $match: {
                'MachineType': parseInt(param.MachineType),      
                'MachineID': parseInt(param.MachineID)
            }
        },
        {
            $lookup: {
                from: 'PMSMaintItemData',
                localField: 'MaintItemUID',
                foreignField: 'UID',
                as: 'MaintData'
            }
        },
        {
            $lookup: {
                from: 'PMSMaintItemLevelType',
                localField: 'Level',
                foreignField: 'UID',
                as: 'LevelData'
            }
        }
    ], function (err, result) {
        if (err) {
            next(err);
            return;
        }

        var dataList = [];
        for (var i = 0; i < result.length; i++) {            
            dataList.push({
                UID: result[i].UID,
                MaintItemUID: result[i].MaintItemUID,
                Code: result[i].MaintData[0].Code,
                Title: result[i].MaintData[0].Title,
                Content: result[i].MaintData[0].Content,
                Level: result[i].LevelData[0].Name
            });
        }

        next(true, dataList);            
    });

}


module.exports.addMachineMaintItem = function (param, next) {

    if (param === null) {
        next(false);
        return;
    }

    /* XXX verify params */

    for (var i = 0; i < param.MaintItemIDList.length; i++) {
        PMSMaintItemDataSchema.
            findOne().
            where('UID').equals(param.MaintItemIDList[i].ID).            
            exec(function (err, item) {
                if (err) {
                    next(err);
                    return;
                }                

                var data = new PMSMachineItemDataSchema();
                data.MachineType = param.MachineType;
                data.MachineID = param.MachineID;
                data.MaintItemUID = item.UID;
                data.DeviceType = item.DeviceType;
                data.CreateDate = new Date();
                data.CheckType = item.CheckType;
                data.TBMCheckUnit = item.TBMCheckUnit;
                data.TBMCheckValue = item.TBMCheckValue;
                data.CBMCheckUnit = item.CBMCheckUnit;
                data.CBMCheckLimitValue = item.CBMCheckLimitValue;
                data.CBMCheckWarnLimitValue = item.CBMCheckWarnLimitValue;
                data.Relation = item.Relation;
                data.Type = item.Type;
                data.Level = item.Level;

                data.save(function (err) {
                    if (err) {
                        console.log(err);
                        next(false);
                        return;
                    }
                });                               
            });
    }

    next(true);
}


module.exports.removeMachineMaintItem = function (param, next) {

    if (param === null) {
        next(false);
        return;
    }

    for (var i = 0; i < param.MaintItemIDList.length; i++) {
        PMSMachineItemDataSchema.
            find().
            where('UID').equals(param.MaintItemIDList[i].ID).
            remove().
            exec(function (err) {
                if (err) {
                    console.log(err);
                    next(false);
                    return;
                }
            });            
    }

    next(true);
}