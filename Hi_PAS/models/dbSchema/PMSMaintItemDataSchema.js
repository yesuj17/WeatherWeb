var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSMaintItemDataSchema = new Schema({
    UID : Number,
    Code : String,
    Title : String,
    Content : String,    
    DeviceType : Number,  /* PMSDeviceTypeSchema UID */           
    CreateDate : { type: Date },
    CheckType : Number,  /* 0 == TBM, 1 == CBM */
    TBMCheckUnit : Number,  /* PMSTBMCheckUnitTypeSchema UID,  0 : Daily, 1 : Weekly, 2 : Monthly */
    TBMCheckValue : Number,   /* Weekly : 1 ~ 2 , Monthly : 1 ~ 31 */
    CBMCheckUnit : Number, /* PMSCBMCheckUnitTypeSchema UID,  0 : Count , 1 : Distance */
    CBMCheckLimitValue : Number,
    CBMCheckWarnLimitValue : Number,
    Relation : [], /* array(String) */
    Type : Number, /* 0 : Check, 1 : Action */
    Level : Number  /* PMSItemLevelType UID */
});

module.exports = mongoose.model('PMSMaintItemDataSchema', PMSMaintItemDataSchema, "PMSMaintItemData");