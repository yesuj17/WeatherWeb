var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSCBMCheckUnitTypeSchema = new Schema({
    UID : Number,    
    Name : String
});

module.exports = mongoose.model('PMSCBMCheckUnitTypeSchema', PMSCBMCheckUnitTypeSchema, "PMSCBMCheckUnitType");