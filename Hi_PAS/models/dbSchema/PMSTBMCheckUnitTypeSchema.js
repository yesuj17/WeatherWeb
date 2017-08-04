var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSTBMCheckUnitTypeSchema = new Schema({
    UID : Number,
    Name : String
});

module.exports = mongoose.model('PMSTBMCheckUnitTypeSchema', PMSTBMCheckUnitTypeSchema, "PMSTBMCheckUnitType");