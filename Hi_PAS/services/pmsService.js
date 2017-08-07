var dbManager = require('../utility/dbManager/pmsDBManager');

var currentTBMMachineItemList = [];
var currentCBMMachineItemList = [];
var PMSCheckType = {
    TBM: 0,
    CBM: 1
}

var maintDate;
module.exports = function (next) {
    /* Initialize PMS Service */
    initializePMSService();

    /* Run */
    intervalCheckTodoList();

    next(true);
}

function initializePMSService() {
    maintDate= new Date();
    maintDate.setHours(0, 0, 0, 0);
}

// Interval Check Todo List
function intervalCheckTodoList() {
    // Get Check List
    dbManager.getMachineItemDataList(function (result, machineItemDataList) {
        if (result) {
            // Check TBM Item
            checkTBMItem(machineItemDataList);

            // Check CBM Item
            checkCBMItem(machineItemDataList);
        }

        setTimeout(intervalCheckTodoList, 1000);
    });
}

// Check TBM
function checkTBMItem(machineItemDataList) {
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (maintDate.getTime() != currentDate.getTime()) {
        currentTBMMachineItemList = [];
        maintDate = currentDate;
    }

    for (var newMachineItemDataIndex = 0;
        newMachineItemDataIndex < machineItemDataList.length;
        newMachineItemDataIndex++) {
        if (machineItemDataList[newMachineItemDataIndex].Type
            == PMSCheckType.CBM) {
            continue;
        }

        var isExistItem = false;
        for (var currentMachineItemDataIndex = 0;
            currentMachineItemDataIndex < currentTBMMachineItemList.length;
            currentMachineItemDataIndex++) {
            if (currentTBMMachineItemList[currentMachineItemDataIndex].UID
                == machineItemDataList[newMachineItemDataIndex].UID) {
                isExistItem = true;
            }
        }

        if (isExistItem == false) {
            currentTBMMachineItemList.push(machineItemDataList[newMachineItemDataIndex]);
            dbManager.addTodoItem(maintDate, machineItemDataList[newMachineItemDataIndex], function (result, newTodoItem) {
                if (result == true) {
                     /* XXX Send New Todo Item */
                }
            });
        }
    }

    
}

// Check CBM
function checkCBMItem(checkList) {
    // Todo List 추가
    // Todo List 수정
}