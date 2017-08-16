/* DB Manager */
var mongoose = require('mongoose');
var async = require('async');
var systemConfig = require('../../config/systemConfig');
var machineDBManager = require('./machineDBManager.js');
var pmsDBManager = require('./pmsDBManager.js');
var autoIncrement = require('mongoose-auto-increment');


// Connect to Mongo DB
module.exports.connect = function (next) {
    mongoose.Promise = global.Promise;

    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', function () {
        console.log("Connected to mongo server");
    });

    autoIncrement.initialize(db);    

    mongoose
        .connect(systemConfig.db.urls, function () {
            /* Dummy Function */
        })
        .then(() => {
  
            /* Initialize DB */
            async.waterfall([
                function (callback) {
                    machineDBManager.InitMachineDB(function (result) {
                        if (result == true) {
                            callback(null);
                        }
                        else {
                            callback("initMachineDB failed");
                        }
                    });
                },
                function (callback) {
                    pmsDBManager.InitPMSDB(function (result) {
                        if (result == true) {
                            callback(null);
                        }
                        else {
                            callback("InitPMSDB failed");
                        }
                    });
                }
            ], function (err) {
                if (err) {
                    console.error(err);
                    next(false);
                }
                else {
                    next(true);
                }                            
            });           
        })
        .catch(err => {
            next(false);
        });
}