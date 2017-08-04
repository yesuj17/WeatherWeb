var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSDeviceTypeSchema = new Schema({
    UID : Number,
    MachineType : Number,  /* PMSMachineTypeSchema UID */
    ModuleType : Number,  /* PMSModuleTypeSchema UID */
    Name : String
});

module.exports = mongoose.model('PMSDeviceTypeSchema', PMSDeviceTypeSchema, "PMSDeviceType");