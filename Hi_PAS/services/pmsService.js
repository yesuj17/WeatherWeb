var dbManager = require('../utility/dbManager/pmsDBManager');

var currentCBMMachineItemList = [];
var PMSCheckType = {
    TBM: 0,
    CBM: 1
}

var TBMDateUnit = {
    Total: 0,
    Day: 1,
    Week: 2,
    Month: 3
}

module.exports = function (next) {
    /* Initialize PMS Service */
    initializePMSService();

    /* Run */
    intervalCheckTodoList();

    next(true);
}

function initializePMSService() {
}

// Interval Check Todo List
function intervalCheckTodoList() {
    // Get Check List
    dbManager.getAllMachineItemDataList(function (result, machineItemDataList) {
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
    var maintDate = new Date();
    maintDate.setHours(0, 0, 0, 0);

    for (var newMachineItemDataIndex = 0;
        newMachineItemDataIndex < machineItemDataList.length;
        newMachineItemDataIndex++) {
        if (machineItemDataList[newMachineItemDataIndex].Type
            == PMSCheckType.CBM) {
            continue;
        }

        var isAddTodoItem = false;
        var newMachineItemData = machineItemDataList[newMachineItemDataIndex];
        if (newMachineItemData.TBMCheckUnit
            == TBMDateUnit.Month) {
            if (newMachineItemData.TBMCheckValue == maintDate.getDate()) {
                isAddTodoItem = true;
            }
        } else if (newMachineItemData.TBMCheckUnit
            == TBMDateUnit.Week) {
            if (newMachineItemData.TBMCheckValue == maintDate.getDay()) {
                isAddTodoItem = true;
            }
        } else {
            isAddTodoItem = true;
        }

        if (isAddTodoItem) {
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