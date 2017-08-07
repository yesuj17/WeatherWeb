var wemsRestfulAPIHandler = require('../restfulAPIHandlers/wemsRestfulAPIHandler');
var pdasRestfulAPIHandler = require('../restfulAPIHandlers/pdasRestfulAPIHandler');
var pmsRestfulAPIHandler = require('../restfulAPIHandlers/pmsRestfulAPIHandler');
var machineAgentRestfulAPIHandler = require('../restfulAPIHandlers/machineAgentRestfulAPIHandler');
var dataGeneratorRestfulAPIHandler = require('../restfulAPIHandlers/dataGeneratorRestfulAPIHandler');

/* WEMS Restful API Handler */
var wemsGETList = [
    ['/wems/getAnalysisData', wemsRestfulAPIHandler.getAnalysisData],
    ['/wems/getManagementData', wemsRestfulAPIHandler.getManagementData],
    ['/wems/analysisPreview', wemsRestfulAPIHandler.getAnalysisPreview],
    ['/wems/getTotalAlarmMessage', wemsRestfulAPIHandler.getTotalAlarmMessage]
];

var wemsPOSTList = [
    ['/wems/updateAnalysisPreviewData', wemsRestfulAPIHandler.updateAnalysisPreviewData]
];
var wemsPUTList = [
    ['/wems/updateManagementData', wemsRestfulAPIHandler.updateManagementData]
];

var wemsDELETEList;

/* PdAS Restful API Handler */
var pdasGETList = [
    ['/pdas', pdasRestfulAPIHandler.PdAS],
    //['/pdas/dataAnalysis', pdasRestfulAPIHandler.DataAnalysis],
    ['/pdas/dataAnalysis/:fromDate/:toDate', pdasRestfulAPIHandler.DataAnalysis]
];

var pdasPOSTList = [
    ['/pdas/CurrData', pdasRestfulAPIHandler.CurrentData]
];

var pdasPUTList;
var pdasDELETEList;

/* PMS Restful API Handler */
var pmsGETList = [
    ['/pms/getLoginData', pmsRestfulAPIHandler.getLoginData],
    ['/pms/getUsersData', pmsRestfulAPIHandler.getUsersData],
    ['/pms/getNoticesData', pmsRestfulAPIHandler.getNoticesData],
    ['/pms/getNoticesDataNewCount', pmsRestfulAPIHandler.getNoticesDataNewCount],
    ['/pms/displaymothertable', pmsRestfulAPIHandler.DisplayGridMotherdata],
    ['/pms/onemother', pmsRestfulAPIHandler.getmotheronedata],
    ['/pms/getcode', pmsRestfulAPIHandler.getcode],
    ['/pms/getallfacility', pmsRestfulAPIHandler.getallfacility],
    ['/pms/getFacilityCheckData', pmsRestfulAPIHandler.getFacilityCheckData],

    /* Maint Item API *********************************************/
    ['/pms/getMaintItemList', pmsRestfulAPIHandler.getMaintItemList],
    ['/pms/getMachineTypeList', pmsRestfulAPIHandler.getMachineTypeList],
    ['/pms/getModuleTypeList', pmsRestfulAPIHandler.getModuleTypeList],
    ['/pms/getDeviceTypeList', pmsRestfulAPIHandler.getDeviceTypeList],
    ['/pms/getMaintItemLevelList', pmsRestfulAPIHandler.getMaintItemLevelList],
    ['/pms/getTBMCheckUnitList', pmsRestfulAPIHandler.getTBMCheckUnitList],
    ['/pms/getCBMCheckUnitList', pmsRestfulAPIHandler.getCBMCheckUnitList],

    /* Machine Maint Item API *************************************/
    ['/pms/getMachineMaintItemList', pmsRestfulAPIHandler.getMachineMaintItemList],

    /* Calendar API ***********************************************/
    ['/pms/getMemoInfoList', pmsRestfulAPIHandler.getMemoInfoList],    
    ['/pms/getMemoInfo', pmsRestfulAPIHandler.getMemoInfo],
    ['/pms/getEventGroupList', pmsRestfulAPIHandler.getEventGroupList],
    ['/pms/getEventList', pmsRestfulAPIHandler.getEventList],

    /* History API ************************************************/
    ['/pms/getMaintHistoryList', pmsRestfulAPIHandler.getMaintHistoryList],
    ['/pms/getSystemLogList', pmsRestfulAPIHandler.getSystemLogList],

    /* Todo List API ************************************************/
    // ['/pms/getTodoList', pmsRestfulAPIHandler.getTodoList],
    ['/pms/getTodoGroupList', pmsRestfulAPIHandler.getTodoGroupList],
    ['/pms/getGroupTodoListPerDate', pmsRestfulAPIHandler.getGroupTodoListPerDate],
    ['/pms/getTotalTodoListPerDate', pmsRestfulAPIHandler.getTotalTodoListPerDate]
];

var pmsPOSTList = [
    ['/pms/validateUserData', pmsRestfulAPIHandler.validateUserData],
    ['/pms/loginUserData', pmsRestfulAPIHandler.loginUserData],
    ['/pms/addUserLevelData', pmsRestfulAPIHandler.addUserLevelData],
    ['/pms/addUserData', pmsRestfulAPIHandler.addUserData],
    ['/pms/updateUserData', pmsRestfulAPIHandler.updateUserData],
    ['/pms/updateNoticeData', pmsRestfulAPIHandler.updateNoticeData],
    ['/pms/addNoticeData', pmsRestfulAPIHandler.addNoticeData],
    ['/pms/addNoticeUserReadData', pmsRestfulAPIHandler.addNoticeUserReadData],
    ['/pms/createmother', pmsRestfulAPIHandler.ImportExcel],
    ['/pms/updateitem', pmsRestfulAPIHandler.updateitem],
    ['/pms/createmotherone', pmsRestfulAPIHandler.createmother],
    ['/pms/createfacility', pmsRestfulAPIHandler.createfacility],
    ['/pms/createchecklist', pmsRestfulAPIHandler.createchecklist],

    /* Maint Item API *********************************************/
    ['/pms/createMaintItem', pmsRestfulAPIHandler.createMaintItem],

    /* Calendar API ***********************************************/
    ['/pms/updateEventGroupSchedule', pmsRestfulAPIHandler.updateEventGroupSchedule],
    ['/pms/updateEventsSchedule', pmsRestfulAPIHandler.updateEventsSchedule]
];

var pmsPUTList = [
    
];
var pmsDELETEList = [
    ['/pms/deleteUserData', pmsRestfulAPIHandler.deleteUserData],
    ['/pms/deleteNoticeData', pmsRestfulAPIHandler.deleteNoticeData],
    ['/pms/deletemother', pmsRestfulAPIHandler.deletemother]
];

/* Machine Agent Restful API Handler */
var machineAgentPOSTList = [
    ['/MA/updateMachineConfig', machineAgentRestfulAPIHandler.updateMachineConfig],
    ['/MA/addMachineRealTimeData', machineAgentRestfulAPIHandler.addMachineRealTimeData],
    ['/MA/addMachineCycleData', machineAgentRestfulAPIHandler.addMachineCycleData],
    ['/MA/addMachineErrorData', machineAgentRestfulAPIHandler.addMachineErrorData]
];

var machineAgentGetList = [
    ['/MA/getMachineInfoList', machineAgentRestfulAPIHandler.getMachineInfoList]    
];


/* Data Generator Restful API Handler */
var dataGeneratorAgentGETList  = [['/dataGenerator', dataGeneratorRestfulAPIHandler.DataGenerator]];
var dataGeneratorAgentPOSTList = [['/dataGenerator/GenerateDummyData', dataGeneratorRestfulAPIHandler.GenerateDummyData]];

module.exports = function (app, io) {
    /* Main Page */
    app.get('/', function (req, res) {
        if (!req.session.user) {
            res.redirect('/pms/getLoginData?UserName=Admin');
        }
        else {
            res.render('index', { user: req.session.user });
        }
    });

    /* Restful API */
    /* Set WEMS Restful API Handler */
    if (wemsGETList) {
        wemsGETList.forEach(setGETHandler.bind(null, app));
    }

    if (wemsPOSTList) {
        wemsPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    if (wemsPUTList) {
        wemsPUTList.forEach(setPUTHandler.bind(null, app));
    }

    if (wemsDELETEList) {
        wemsDELETEList.forEach(setDELETEHandler.bind(null, app));
    }

    /* Set PdAS Restful API Handler */
    if (pdasGETList) {
        pdasGETList.forEach(setGETHandler.bind(null, app));
    }

    if (pdasPOSTList) {
        pdasPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    if (pdasPUTList) {
        pdasPUTList.forEach(setPUTHandler.bind(null, app));
    }

    if (pdasDELETEList) {
        pdasDELETEList.forEach(setDELETEHandler.bind(null, app));
    }

    /* Set PMS Restful API Handler */
    if (pmsGETList) {
        pmsGETList.forEach(setGETHandler.bind(null, app));
    }

    if (pmsPOSTList) {
        pmsPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    if (pmsPUTList) {
        pmsPUTList.forEach(setPUTHandler.bind(null, app));
    }

    if (pmsDELETEList) {
        pmsDELETEList.forEach(setDELETEHandler.bind(null, app));
    }

    /* Set Machine Agent Restful API Handler */
    if (machineAgentPOSTList) {
        machineAgentPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    if (machineAgentGetList) {
        machineAgentGetList.forEach(setGETHandler.bind(null, app));
    }

    /* Set Data Generator Restful API Handler */
    if (dataGeneratorAgentGETList) {
        dataGeneratorAgentGETList.forEach(setGETHandler.bind(null, app));
    }

    if (dataGeneratorAgentPOSTList) {
        dataGeneratorAgentPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    /* Web Socket */
    io.on('connection', function (socket) {
        console.log("webosocket connected");
    });
}

/* Restful API Handler */
function setGETHandler(app, data) {
    app.get(data[0], data[1]);
}

function setPOSTHandler(app, data) {
    app.post(data[0], data[1]);
}

function setPUTHandler(app, data) {
    app.put(data[0], data[1]);
}

function setDELETEHandler(app, data) {
    app.delete(data[0], data[1]);
}
