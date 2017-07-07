var wemsRestfulAPIHandler = require('../restfulAPIHandlers/wemsRestfulAPIHandler');
var pdasRestfulAPIHandler = require('../restfulAPIHandlers/pdasRestfulAPIHandler');
var pmsRestfulAPIHandler = require('../restfulAPIHandlers/pmsRestfulAPIHandler');
var machineAgentRestfulAPIHandler = require('../restfulAPIHandlers/machineAgentRestfulAPIHandler');
var dataGeneratorRestfulAPIHandler = require('../restfulAPIHandlers/dataGeneratorRestfulAPIHandler');

/* WEMS Restful API Handler */
var wemsGETList = [
    ['/wems/analysisData', wemsRestfulAPIHandler.getAnalysisData]
];

var wemsPOSTList;
var wemsPUTList;
var wemsDELETEList;

/* PdAS Restful API Handler */
var pdasGETList = [
    ['/pdas', pdasRestfulAPIHandler.PdAS],
    ['/pdas/dataAnalysis', pdasRestfulAPIHandler.DataAnalysis],
    ['/pdas/dataAnalysis/:period', pdasRestfulAPIHandler.DataAnalysis]
];

var pdasPOSTList = [
    ['/pdas/CurrData', pdasRestfulAPIHandler.CurrentData]
];

var pdasPUTList;
var pdasDELETEList;

/* PMS Restful API Handler */
var pmsGETList = [
    ['/pms/getUserData', pmsRestfulAPIHandler.getUserData],
    ['/pms/getUserDataCount', pmsRestfulAPIHandler.getUserDataCount],
    ['/pms/getNoticeData', pmsRestfulAPIHandler.getNoticeData],
    ['/pms/getNoticeDataCount', pmsRestfulAPIHandler.getNoticeDataCount],
    ['/pms', pmsRestfulAPIHandler.pmsrend]
];

var pmsPOSTList = [
    ['/pms/addUserData', pmsRestfulAPIHandler.addUserData],
    ['/pms/updateUserData', pmsRestfulAPIHandler.updateUserData],
    ['/pms/deleteUserData', pmsRestfulAPIHandler.deleteUserData],
    ['/pms/addNoticeData', pmsRestfulAPIHandler.addNoticeData],
    ['/pms/insertMother', pmsRestfulAPIHandler.AddMotherData],
    ['/upload', pmsRestfulAPIHandler.ImportExcel]
];

var pmsPUTList;
var pmsDELETEList;

/* Machine Agent Restful API Handler */
var machineAgentPOSTList = [
    ['/MA/updateMachineConfig', machineAgentRestfulAPIHandler.updateMachineConfig],
    ['/MA/addMachineRealTimeData', machineAgentRestfulAPIHandler.addMachineRealTimeData],
    ['/MA/addMachineCycleData', machineAgentRestfulAPIHandler.addMachineCycleData],
    ['/MA/addMachineErrorData', machineAgentRestfulAPIHandler.addMachineErrorData]
];

/* Data Generator Restful API Handler */
var dataGeneratorAgentGETList  = [['/dataGenerator', dataGeneratorRestfulAPIHandler.DataGenerator]];
var dataGeneratorAgentPOSTList = [['/dataGenerator/GenerateDummyData', dataGeneratorRestfulAPIHandler.GenerateDummyData]];

module.exports = function (app, io) {
    /* Main Page */
    app.get('/', function (req, res) {
        res.render('index');
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

    /* Set Data Generator Restful API Handler */
    if (dataGeneratorAgentGETList) {
        dataGeneratorAgentGETList.forEach(setGETHandler.bind(null, app));
    }

    if (dataGeneratorAgentPOSTList) {
        dataGeneratorAgentPOSTList.forEach(setPOSTHandler.bind(null, app));
    }

    /* Web Socket */
    io.on('connection', function (socket) {
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
