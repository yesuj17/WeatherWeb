var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSModuleTypeSchema = new Schema({
    UID : Number,
    MachineType : Number,  /* PMSMachineTypeSchema UID */
    Name : String
});

module.exports = mongoose.model('PMSModuleTypeSchema', PMSModuleTypeSchema, "PMSModuleType");