var async = require('async');

async.waterfall([
    function (callback) {
        /* Initialize DB */
        require('./utility/dbManager/commonDBManager').connect(function (result) {
            if (result == true) {
                console.log("DB connection successful");
                callback(null);
            }
            else {                
                callback("Failed to Initailize DB");
            }
        });
    },
    function (callback) {
        /* Initialzie and Start PM Service */
        require('./services/pmsService')(function (result) {
            if (result == true) {
                callback(null);
            } else {
                callback("Failed to Initailze PMS Service");
            }          
        });                
    },
    function (callback) {        

        /* Initialize and Sart Web Service */
        require('./services/webService')();

        callback(null);
    },
], function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
}); 
