var dbManager = require('../utility/dbManager/pmsDBManager');

var currentTBMCheckList = [];
var currentCBMCheckList = [];
var timeBaseItem = 1;
var countBaseItem = 2;
module.exports = function (next) {
    /* Initialize PMS Service */    

    /* Run */
    intervalCheckTodoList();

    next(true);
}

// Interval Check Todo List
function intervalCheckTodoList() {
    // Get Check List
    dbManager.getCheckList(function (result, checkList) {
        if (result) {
            // Check TBM Item
            checkTBMItem(checkList);

            // Check CBM Item
            checkCBMItem(checkList);
        }

        setTimeout(intervalCheckTodoList, 1000);
    });
}

// Check TBM
function checkTBMItem(checkList) {
    var newCheckList = [];
    for (var newCheckIndex = 0;
        newCheckIndex < checkList.length;
        newCheckIndex++) {
        if (checkList[newCheckIndex].TimeGroup == countBaseItem) {
            continue;
        }

        var isExistItem = false;
        for (var currentCheckIndex = 0;
            currentCheckIndex < currentTBMCheckList.length;
            currentCheckIndex++) {
            if ((currentTBMCheckList[currentCheckIndex].FacilityId
                == checkList[newCheckIndex].FacilityId)
                && (currentTBMCheckList[currentCheckIndex].Code
                == checkList[newCheckIndex].Code)) {
                isExistItem = true;
            }
        }

        if (isExistItem == false) {
            currentTBMCheckList.push(checkList[newCheckIndex]);
            newCheckList.push(checkList[newCheckIndex]);
        }
    }

    dbManager.addTodoItem(newCheckList, function (result, todoList) {
        if (result == true) {
            // Send New Todo List
        }
    });
}

// Check CBM
function checkCBMItem(checkList) {
    // Todo List 추가
    // Todo List 수정
}