var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSToDoDataSchema = new Schema({
    UID: Number,
    MaintDate: Date,
    MachineItemUID: Number, /* PMSMachineItemMaintItemDataSchema UID */
    /* XXX Todo List 임시 */
    MachineItemObjectID: { type: Schema.Types.ObjectId, ref: 'PMSMachineItemDataSchema'},
    Status: Number, /* 0 : 미점검, 1 : 점검 완료 */
    CheckResult: Number, /* 0 : OK, 1 : NG */
    ActionMaintItemUID: Number, /* 조치 항목 UID, -1 : undefined */
    CheckDate: Date,
    ActionDate: Date
});

module.exports = mongoose.model('PMSToDoDataSchema', PMSToDoDataSchema, "PMSToDoData");