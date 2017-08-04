var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSMachineTypeSchema = new Schema({
    UID : Number,
    Name : String    
});

module.exports = mongoose.model('PMSMachineTypeSchema', PMSMachineTypeSchema, "PMSMachineType");