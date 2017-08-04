var langDB = [    
    ["LID_PMS_TASK_SCHEDULE_CHANGED", "(%s) (%s) 점검 일정이 변경되었습니다", "(%s) %s task schedule is changed"],
    ["LID_COMMON_STACKERCRANE", "StackerCrane", "StackerCrane"],
    ["LID_COMMON_LGV", "LGV", "LGV"],
    ["LID_COMMON_AGV", "AGV", "AGV"],
    ["LID_COMMON_SC_MOUDLE_DRIVING", "주행부", "Driving"],
    ["LID_COMMON_SC_MOUDLE_UPPER_DRIVING", "주행상부", "UpperDriving"],
    ["LID_COMMON_SC_MOUDLE_FORK", "포크부", "Fork"],
    ["LID_COMMON_SC_MOUDLE_HOISTING", "승강부", "Hoisting"],
    ["LID_COMMON_SC_DEVICE_MOTOR", "모터", "Motor"],
    ["LID_COMMON_SC_DEVICE_BREAK", "브레이크", "Break"],
    ["LID_COMMON_SC_DEVICE_ROLLER", "롤러", "Roller"],
    ["LID_PMS_MAINT_ITEM_LEVEL1", "높음", "Level 1"],
    ["LID_PMS_MAINT_ITEM_LEVEL2", "중간", "Level 2"],
    ["LID_PMS_MAINT_ITEM_LEVEL3", "낮음", "Level 3"],
    ["LID_PMS_MAINT_ITEM_LEVEL9", "사용자 정의", "User Define"],
    ["LID_COMMON_ETC", "기타", "ETC"],
    ["LID_PMS_TBM_CHECK_UNIT_DAILY", "일일", "Daily"],
    ["LID_PMS_TBM_CHECK_UNIT_WEEKLY", "주간", "Weekly"],
    ["LID_PMS_TBM_CHECK_UNIT_MONTHLY", "월간", "Monthly"],
    ["LID_PMS_CBM_CHECK_UNIT_COUNT", "횟수", "Count"],
    ["LID_PMS_CBM_CHECK_UNIT_DISTANCE", "거리", "Distance"]
];

module.exports.getLangString = function (LID) {
    
    for (var i = 0; i < langDB.length; i++) {

        if (LID == langDB[i][0]) {
            return langDB[i][1];
        }
    }

    return null;
}