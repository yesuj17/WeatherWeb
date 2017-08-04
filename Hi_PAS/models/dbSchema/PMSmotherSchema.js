var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/********** TimeGroup(임시) **********
* TimeBase  : 1
* CountBase : 2
**************************************/
/********* TimeBaseUnit(임시) *********
* Day   : 1
* Week : 2
* Month  : 3
**************************************/
var PMSmotherSchema = new Schema({
    Code: { type: String, default: '-' },
    Title: { type: String, default: '-' },
    Content: { type: String, default: '-' },
    LargeCategory: { type: String, default: '-' },
    MediumCategory: { type: String, default: '-' },
    SmallCategory: { type: String, default: '-' },
    CreateDate: { type: Date, default: Date.now },
    TimeGroup: { type: Number, default: 1 },
    TimeBaseUnit: { type: Number, default: 1 },
    TimeBaseValue: { type: Number, default: 1 },
    nonTimeBaseMainUnit: { type: String, default: '-' },
    nonTimeBaseMainValue: { type: Number, default: 0 },
    nonTimeBaseWarningUnit: { type: String, default: '-' },
    nonTimeBaseWarningValue: { type: Number, default: 0 },
    Relation: [],
    Type: String,
    Level: Number
});

module.exports = mongoose.model('PMSmotherSchema', PMSmotherSchema);