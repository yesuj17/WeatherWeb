var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSmotherSchema = new Schema({
    Code: String,
    Title: String,
    Content: String,
    LargeCategory: String,
    MediumCategory: String,
    SmallCategory: String,
    CreateDate: Date,
    TimeGroup: String,
    TimeBaseUnit: String,
    TimeBaseValue: Number,
    nonTimeVaseMainUnit: String,
    nonTimeBaseMainValue: Number,
    nonTimeBaseWarringUnit: String,
    nonTimeBaseWarringValue: Number,
    Relation: [],
    Type: String,
    Level: Number
});

module.exports = mongoose.model('PMSmotherSchema', PMSmotherSchema);