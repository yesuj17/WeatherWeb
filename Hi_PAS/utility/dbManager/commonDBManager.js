/* DB Manager */
var mongoose = require('mongoose');
var systemConfig = require('../../config/systemConfig');

// Connect to Mongo DB
module.exports.connect = function () {
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;

    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', function () {
        console.log("Connected to mongo server");
    });

    mongoose
        .connect(systemConfig.db.urls, function () {
            /* Dummy Function */
        })
        .then(() => {            
            return true;
        })
        .catch(err => {
            console.error('App starting error:', err.stack);
            console.error("Failed to Connect Mongo DB!");
            process.exit(1);
        });
}