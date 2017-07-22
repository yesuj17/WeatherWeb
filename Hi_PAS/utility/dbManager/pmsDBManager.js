require('date-utils');
var mongoose = require('mongoose');
var async = require('async');
var UserInfoSchema = require('../../models/dbSchema/UserInfoSchema.js');
var NoticeInfoSchema = require('../../models/dbSchema/NoticeInfoSchema.js');
var UserLevelSchema = require('../../models/dbSchema/UserLevelSchema.js');
var motherDataSchema = require('../../models/dbSchema/PMSmotherSchema.js');

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

        notice.Title = param.noticeTitle;
        notice.Content = param.noticeContent;
        notice.Writer = param.noticeWriter;
        notice.Option = param.noticeOption
        notice.StartDate = Date.now();
        notice.EndDate = param.noticeEndDate;

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
    motherDataSchema.findOne({ Code: InputmotherData.Code }, function (err, doc) {
        if (err) {
          //debug  console.log(" [CreateMotherData]스키마에서 찾다가 에러남.");
         //   next(3, err);
            return;
        }
        //data이미 가 있으면 중복처리
        if (doc) {
          //debug  console.log(" [CreateMotherData]스키마에 이미 존재");
         //   next(2, 'duplicate');
            return;
        }
    });
    //db에 input 하려는 데이터가 없을 때 새로 생성. 
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
    a.nonTimeVaseMainUnit = InputmotherData.nonTimeVaseMainUnit;
    a.nonTimeBaseMainValue = InputmotherData.nonTimeBaseMainValue;
    a.nonTimeBaseWarringUnit = InputmotherData.nonTimeBaseWarringUnit;
    a.nonTimeBaseWarringValue = InputmotherData.nonTimeBaseWarringValue;
    a.Relation = InputmotherData.Relation.split(',');
    a.Type = InputmotherData.Type;
    a.Level = InputmotherData.Level;

    a.save(function (err) {
        if (err) {
            console.error(err);
          //debug  console.log(" [CreateMotherData]model 저장실패");
          //  next(5, 'fail save');
            return;
        } else {
          //debug  console.log(" [CreateMotherData]model 저장 성공");
          //  next(1, 'success save');
        }
    });
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
module.exports.getMothersData = function (next) {
    //debug console.log("getMothersData 실행");
    motherDataSchema.find().select().exec(function (err, doc) {
        if (err) {
            console.err(err);
            next(1, err, doc/* doc : null */)//err발생.
        }
        next(0, err/* err: null */, doc); //정상처리
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