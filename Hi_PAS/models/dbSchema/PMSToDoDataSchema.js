var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection); 

var PMSToDoDataSchema = new Schema({
    UID: {
        type: Number, required: true
    },
    MaintDate: {
        type: Date
    },
    MachineItemUID: {
        type: Number, required: true  /* PMSMachineItemMaintItemDataSchema UID */
    },
    Status: {
        type: Number, required: true  /* 0 : 미점검, 1 : 점검 완료 */
    },
    CheckResult: {
        type: Number, required: true  /* 0 : OK, 1 : NG */
    },
    ActionMaintItemUID: {
        type: Number, required: true  /* 조치 항목 UID, -1 : undefined */
    },
    CheckDate: {
        type: Date
    },
    ActionDate: {
        type: Date
    }
});

PMSToDoDataSchema.plugin(autoIncrement.plugin, {
    model: 'PMSToDoDataSchema',
    field: 'UID',
    startAt: 1
});

module.exports = mongoose.model('PMSToDoDataSchema', PMSToDoDataSchema, "PMSToDoData");
