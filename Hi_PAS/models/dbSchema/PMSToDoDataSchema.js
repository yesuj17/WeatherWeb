var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSToDoDataSchema = new Schema({
    UID : Number,
    MachineItemUID : Number, /* PMSMachineItemMaintItemDataSchema UID */
    Status : Number, /* 0 : 미점검, 1 : 점검 완료 */
    CheckResult : Number, /* 0 : OK, 1 : NG */
    ActionMaintItemUID : Number /* 조치 항목 UID, -1 : undefined */,    
});

module.exports = mongoose.model('PMSToDoDataSchema', PMSToDoDataSchema, "PMSToDoData");