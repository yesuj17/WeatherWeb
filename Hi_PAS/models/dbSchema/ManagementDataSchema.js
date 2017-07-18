var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ManagementDataSchema = new Schema({
    Threshold1: Number,
    Threshold2: Number,
    StandardPower: Number,
    Cost: Number
});

module.exports = mongoose.model('ManagementDataSchema', ManagementDataSchema, "ManagementData");