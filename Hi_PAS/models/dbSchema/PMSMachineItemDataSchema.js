var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSMachineItemDataSchema = new Schema({
    UID : Number, 
    MachineID: Number,
    MaintItemUID: Number, /* PMSMaintItemDataSchema UID */
    DeviceType: Number,  /* PMSDeviceTypeSchema UID */
    CreateDate : { type: Date }, 
    CheckType : Number,  /* 0 == TBM, 1 == CBM */
    TBMPeriodUnit : Number,  /* 0 : Daily, 1 : Weekly, 2 : Monthly */
    TBMPeriodValue : Number,   /* Weekly : 1 ~ 2 , Monthly : 1 ~ 31 */
    CBMPeriodUnit : Number, /* 0 : Count , 1 : Distance */
    CBMPeriodLimitValue : Number,
    CBMPeriodWarnLimitValue : Number,
    Relation : [], /* array(String) */
    Type : Number, /* 0 : Check, 1 : Action */
    Level : Number  /* PMSItemLevelType UID */
});

module.exports = mongoose.model('PMSMachineItemDataSchema', PMSMachineItemDataSchema, "PMSMachineItemData");