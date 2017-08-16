var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection); 

var PMSMachineItemDataSchema = new Schema({
    UID: {
        type: Number, required: true
    },
    MachineType: {
        type: Number, required: true
    },
    MachineID: {
        type: Number, required: true
    },
    MaintItemUID: {
        type: Number, required: true  /* PMSMaintItemDataSchema UID */
    },
    DeviceType: {
        type: Number, required: true            /* PMSDeviceTypeSchema UID */
    },
    CreateDate: {
        type: Date
    },
    CheckType: {
        type: Number, default: 0    /* 0 == TBM, 1 == CBM */
    },
    TBMCheckUnit: {
        type: Number, default: 0   /* PMSTBMCheckUnitTypeSchema UID,  0 : Daily, 1 : Weekly, 2 : Monthly */
    },
    TBMCheckValue: {
        type: Number, default: 1   /* Weekly : 1 ~ 2 , Monthly : 1 ~ 31 */
    },
    CBMCheckUnit: {
        type: Number, default: 0   /* PMSCBMCheckUnitTypeSchema UID,  0 : Count , 1 : Distance */
    },
    CBMCheckLimitValue: {
        type: Number, default: 0
    },
    CBMCheckWarnLimitValue: {
        type: Number, default: 0
    },
    Relation: [], /* array(String) */
    Type: {
        type: Number, default: 0   /* 0 : Check, 1 : Action */
    },
    Level: {
        type: Number, default: 0  /* PMSItemLevelType UID */
    }
});

PMSMachineItemDataSchema.plugin(autoIncrement.plugin, {
    model: 'PMSMachineItemDataSchema',
    field: 'UID',
    startAt: 1
});

module.exports = mongoose.model('PMSMachineItemDataSchema', PMSMachineItemDataSchema, "PMSMachineItemData");