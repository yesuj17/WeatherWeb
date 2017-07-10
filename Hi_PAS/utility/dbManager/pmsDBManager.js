var mongoose = require('mongoose');
var UserInfoSchema = require('../../models/dbSchema/UserInfoSchema.js');
var NoticeInfoSchema = require('../../models/dbSchema/NoticeInfoSchema.js');
var UserLevelSchema = require('../../models/dbSchema/UserLevelSchema.js');

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
    notice.Title = param.noticeTitle;
    notice.Content = param.noticeContent;
    notice.Writer = param.noticeWriter;
    notice.Option = param.noticeOption
    notice.StartDate = Date.now();
    notice.EndDate = param.noticeDate;

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

module.exports.updateNoticeData = function(param, next){
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

        notice.Content = param.noticeContent;

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
module.exports.findUsersDataCount = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    // make search query
    var filter = param.filterValue;
    var search = '.*' + param.searchValue + '.*';

    var query = UserInfoSchema
        .find()
        .where(filter).regex(search)
        .count();

    query.exec(function (err, count) {
        if (err) {
            next(false, err);
            return;
        }
        next(true, '', count);
    });
}

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

    var query = NoticeInfoSchema
        .find()
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

module.exports.findNoticesDataCount = function (param, next) {
    if (!param) {
        next(false, 'param null');
        return;
    }
    // make search query
    var filter = param.filterValue;
    var search = '.*' + param.searchValue + '.*';

    var query = NoticeInfoSchema
        .find()
        .where(filter).regex(search)
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

    var query = NoticeInfoSchema
        .find()
        .where(filter).regex(search)
        .skip(index)
        .limit(size)
        .sort({Option: -1, StartDate: -1});

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

module.exports.InsertMotherdata = function (InputmotherData, next) {
    console.log("InsertMotherdata 실행");
    //input data 유효성 check
    if (!InputmotherData) {
        console.log(" [InsertMotherdata]modeherData가 널임.");
        next(4, 'motherData null');
        return;
    }
    // 들어오는 input data중 동일한 data를 가져오는 쿼리( code값으로 식별)
    motherDataSchema.findOne({ Code: InputmotherData.Code }, function (err, doc){
        if (err) {
            console.log(" [InsertMotherdata]스키마에서 찾다가 에러남.");
            next(3, err);
            return;
        }
        //data이미 가 있으면 중복처리
        if (doc) {
            console.log(" [InsertMotherdata]스키마에 이미 존재");
            next(2, 'duplicate');
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
    a.Relation = InputmotherData.Relation;
    a.Type = InputmotherData.Type;
    a.Level = InputmotherData.Level;
    
    a.save(function (err) {
        if (err) {
            console.error(err);
            console.log(" [InsertMotherdata]model 저장실패");
            next(5, 'fail save');
            return;
        } else {
            console.log(" [InsertMotherdata]model 저장 성공");
            next(1, 'success save');
        }
    });
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialize Default Data
module.exports.onDefaultUserData = function (param) {
    var query = UserInfoSchema
        .findOne()
        .where('UserLevel').equals(param.UserName);

    query.exec(function (err, user) {
        if (err) {
            next(false, err);
            return;
        }

        if (user) {
            return;
        }

        user = new UserInfoSchema();
        user.UserName = param.UserName;
        user.UserLevel = param.UserLevel;
        user.save(function (err) {
            if (err) {
                return;
            }
        });
    });
}

module.exports.onDefaultUserLevelData = function (param) {
    var save = function (param) {
        var query = UserLevelSchema
            .findOne()
            .where('LevelName').equals(param.LevelName);

        query.exec(function (err, userLevel) {
            if (err) {
                return;
            }
            if (userLevel) {
                return;
            }

            userLevel = UserLevelSchema();
            userLevel.LevelName = param.LevelName;
            userLevel.save(function (err) {
                if (err) {
                    return;
                }
            });
        });
    }

    for (var index in param) {
        save(param[index])
    }
}