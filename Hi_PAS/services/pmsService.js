var dbManager = require('../utility/dbManager/pmsDBManager');

var defaultUserData         =   { UserName: 'Admin', UserLevel: 'Admin' };
var defaultUserLevelData    = [ { LevelName: 'Operator' },
                                { LevelName: 'Admin' },
                                { LevelName: 'CSEngineer' } ];

module.exports = function (app) {

    // PMS Default Data
    dbManager.onDefaultUserData(defaultUserData);
    dbManager.onDefaultUserLevelData(defaultUserLevelData);
}