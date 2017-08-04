var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/******* FacilityId(임시) *******
* Device Type : S.C => 01
* Device No.  : 2호기 => 02
* Facility ID : x0102
*********************************/
var CheckListSchema = new Schema({
    FacilityId: Number,
    Code: String,
    CreateDate: Date,
    Level: Number,
    Title: { type: String, default: '-' },
    Content: { type: String, default: '-' },
    LargeCategory: { type: String, default: '-' },
    MediumCategory: { type: String, default: '-' },
    SmallCategory: { type: String, default: '-' },
    TimeGroup: Number,
    TimeBaseUnit: Number,
    TimeBaseValue: Number,
    Relation: []
});

module.exports = mongoose.model('CheckListSchema', CheckListSchema, "CheckList");