require('date-utils');
var mongoose = require('mongoose');
var async = require('async');
var UserInfoSchema = require('../../models/dbSchema/UserInfoSchema.js');
var NoticeInfoSchema = require('../../models/dbSchema/NoticeInfoSchema.js');
var UserLevelSchema = require('../../models/dbSchema/UserLevelSchema.js');
var motherDataSchema = require('../../models/dbSchema/PMSmotherSchema.js');
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

var PMScheckSchema = require('../../models/dbSchema/PMScheckSchema.js');

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
    motherDataSchema.findOne({ Code: InputmotherData.Code }, function (err, doc) {
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
        var a = new motherDataSchema();
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
    var a = new motherDataSchema();
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
        },
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
   //debug console.log("MothersData Drop!");
    dropCollection(motherDataSchema);
    /* var promise = dropCollection(motherDataSchema);
    promise.then(function (text) {
        console.log(text);
    }, function (error) {
        console.log("스키마없다.");
        console.log(error);
    });*/
}
module.exports.getMothersAllData = function (next) {
    //debug console.log("getMothersAllData 실행");
    motherDataSchema.find().select().exec(function (err, doc) {
        if (err) {
            console.err(err);
            next(false, err, doc/* doc : null */)//err발생.
        }
        next(true, err/* err: null */, doc); //정상처리
    });
}
module.exports.getMothersoneData = function (next, Code) {
    console.log("dbmanager에 들어옴req.param.Code:", Code);
    if (!Code) {
        next(false, 'Code null');
        return;
    }

    var query = motherDataSchema
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
    //  motherDataSchema.findOne().select({'Code':Code},function(err,doc){
    //      if (err) {
    //          console.err(err);
    //          next(1, err, doc/* doc : null */)//err발생.
    //      }
    //      next(0, err/* err: null */, doc); //정상처리
    //  });
}
module.exports.getcodeList = function (next) {
    //debug console.log("getMothersAllData 실행");
    motherDataSchema.find().select('Code').exec(function (err, doc) {
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

    var query = motherDataSchema
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
module.exports.saveMothersoneData = function (next, req) {
    console.log("dbmanager에 들어옴req.param.Code:", req.body.Code);
    if (!req) {
        next(false, 'data null');
        return;
    }
    var key = 'Code';
    var query = motherDataSchema
        .findOne()
        .where(key).equals(req.body.Code);

    query.exec(function (err, mother) {
        if (err) {
            next(false, err);
            return;
        }
        if (!mother) {
            next(false, 'mother null');
            return;
        }

        mother.Title = req.body.Title;
        mother.Content = req.body.Content;
        mother.LargeCategory = req.body.LargeCategory.category;// 대분류
        mother.MediumCategory = req.body.MediumCategory.category;//중분류
        mother.SmallCategory = req.body.SmallCategory.category;//소분류
        //   //   mother.CreateDate = req.body.CreateDate;
        mother.TimeGroup = req.body.TimeGroup;// 시간, 거리 
        mother.TimeBaseUnit = req.body.TimeBaseUnit;
        if (req.body.TimeBaseValue != 'distance')
            mother.TimeBaseValue = req.body.TimeBaseValue;

        mother.nonTimeBaseMainUnit = req.body.nonTimeBaseMainUnit.distanceunit;
        mother.nonTimeBaseMainValue = req.body.nonTimeBaseMainValue;
        mother.nonTimeBaseWarningUnit = req.body.nonTimeBaseWarningUnit.distanceunit;
        mother.nonTimeBaseWarningValue = req.body.nonTimeBaseWarningValue;
        //     // mother.Relation = req.body.Relation;
        mother.Type = req.body.Type;
        mother.Level = req.body.Level.grade;


        mother.save(function (err) {
            if (err) {
                next(false, err);
                return;
            }
            next(true);
        });
    });
}

function dropCollection(motherDataSchema) {
    var collection = mongoose.connection.collections[motherDataSchema.collection.collectionName];
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

module.exports.getCheckList = getCheckList;
module.exports.getTodoList = getTodoList;
module.exports.addTodoItem = addTodoItem;

// Get Check List
function getCheckList(next) {
    CheckListSchema.
            find().
            lean().
            exec(function (err, checkList) {
                if (err) {
                    next(false);
                    console.log(err);
                    return;
                }

                next(true, checkList);
                return;
            });
}

// Get Todo List
function getTodoList(period, next) {
    TodoListSchema.
        findOne().
        where("StartDate").gte(period.startDate).
        where("StartDate").lte(period.endDate).
        sort('StartDate').
        lean().
        exec(function (err, todoList) {
            if (err) {
                console.log(err);
                next(false);
                return;
            }

            if (!todoList) {
                todoList = new Object();
                todoList.TodoList = [];
                next(true, todoList);
                return;
            }

            next(true, todoList);
        });
}

// Get Total Todo List Per Date
function getTotalTodoListPerDate(period, next) {
    
}

// Add Todo Item
function addTodoItem(newCheckList, next) {
    if (newCheckList.length == 0) {
        next(false);
        return;
    }

    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    var newTodoList = {};
    newTodoList.StartDate = currentDate;
    newTodoList.TodoList = [];

    TodoListSchema.
        findOneAndUpdate({ StartDate: currentDate }, newTodoList, { upsert: true, new: true }).
        exec(function (err, todoList) {
            for (var newTodoListIndex = 0; newTodoListIndex < newCheckList.length; newTodoListIndex++) {
                var newCheckItem = newCheckList[newTodoListIndex];
                var newTodoItem = {
                    FacilityId: newCheckItem.FacilityId,
                    Code: newCheckItem.Code,
                    CheckDate: null,
                    Level: newCheckItem.Level,
                    Title: newCheckItem.Title,
                    Content: newCheckItem.Content,
                    LargeCategory: newCheckItem.LargeCategory,
                    MediumCategory: newCheckItem.MediumCategory,
                    SmallCategory: newCheckItem.SmallCategory,
                    TimeGroup: newCheckItem.TimeGroup,
                    TimeBaseUnit: newCheckItem.TimeBaseUnit,
                    TimeBaseValue: newCheckItem.TimeBaseValue,
                    MemoListID: 0,
                    FileListID: 0,
                    Result: newCheckItem.Result,
                    ActionDate: null,
                    State: newCheckItem.State,
                    Relation: newCheckItem.Relation
                };

                todoList.TodoList.push(newTodoItem);
                newTodoList.TodoList.push(newTodoItem);
            }

            todoList.save(function (err) {
                if (err) {
                    console.log(err);
                    next(false);
                    return;
                }

                next(true, newTodoList);
            });
        });
}

///////////////////////////////////////////////////
// XXX For Add Default Check List DB : Must Remove
module.exports.initializeCheckListData = initializeCheckListData;
function initializeCheckListData() {
    mongoose.connection.db.listCollections({ name: 'CheckList' })
        .next(function (err, collinfo) {
            if (!collinfo) {
                /// Fill Default CheckList
                /*** 임시 Facility ID ***
                장비 타입 : S.C => 01
                장비 호기 : 2호기 => 02
                Facility ID : x0102
                **************************/
                motherDataSchema.
                    find().
                    lean().
                    exec(function (err, motherDataList) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        var checkList = [];
                        for (var deviceIndex = 1; deviceIndex < 9; deviceIndex++) {
                            for (var index = 0; index < motherDataList.length; index++) {
                                var motherData = motherDataList[index];
                                var formattedNumber = ("0" + deviceIndex).slice(-2);
                                var facilityId = "01" + formattedNumber;
                                var checkItem = {
                                    FacilityId: parseInt(facilityId, 16),
                                    Code: motherData.Code,
                                    Level: motherData.Level,
                                    CreateDate: motherData.CreateDate.setHours(0, 0, 0, 0),
                                    Title: motherData.Title,
                                    Content: motherData.Content,
                                    LargeCategory: motherData.LargeCategory,
                                    MediumCategory: motherData.MediumCategory,
                                    SmallCategory: motherData.SmallCategory,
                                    TimeGroup: motherData.TimeGroup,
                                    TimeBaseUnit: motherData.TimeBaseUnit,
                                    TimeBaseValue: motherData.TimeBaseValue,
                                    Relation: motherData.Relation
                                }

                                checkList.push(checkItem);
                            }
                        }

                        CheckListSchema
                            .insertMany(checkList, function (err) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                            });
                    });
            }
        });
}

module.exports.getMaintItemList = function (next) {

    PMSMaintItemDataSchema.
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
    data.UID = 1;
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