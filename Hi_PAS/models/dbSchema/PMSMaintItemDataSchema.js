var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection); 

var PMSMaintItemDataSchema = new Schema({
    UID: {
        type: Number, required: true
    },
    Code: {
        type: String, default: ''
    },
    Title: {
        type: String, default: ''
    },
    Content: {
        type: String, default: ''
    },
    DeviceType: {
        type: Number,               /* PMSDeviceTypeSchema UID */           
    },    
    CreateDate : { type: Date },
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
    Relation : [], /* array(String) */
    Type: {
        type: Number, default: 0   /* 0 : Check, 1 : Action */
    },    
    Level: {
        type: Number, default: 0  /* PMSItemLevelType UID */
    }
});

PMSMaintItemDataSchema.plugin(autoIncrement.plugin, {
    model: 'PMSMaintItemDataSchema',
    field: 'UID',
    startAt: 1
});

module.exports = mongoose.model('PMSMaintItemDataSchema', PMSMaintItemDataSchema, "PMSMaintItemData");