var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSmotherSchema = new Schema({
    Code: { type: String, default: '-' },
    Title: { type: String, default: '-' },
    Content: { type: String, default: '-' },
    LargeCategory: { type: String, default: '-' },
    MediumCategory: { type: String, default: '-' },
    SmallCategory: { type: String, default: '-' },
    CreateDate: { type: Date, default: Date.now },
    TimeGroup: { type: String, default: '-' },
    TimeBaseUnit: { type: String, default: '-' },
    TimeBaseValue: { type: String, default: '-' },
    nonTimeVaseMainUnit: { type: String, default: '-' },
    nonTimeBaseMainValue: { type: Number, default: 0 },
    nonTimeBaseWarringUnit: { type: String, default: '-' },
    nonTimeBaseWarringValue: { type: Number, default: 0 },
    Relation: [],
    Type: String,
    Level: Number
});

module.exports = mongoose.model('PMSmotherSchema', PMSmotherSchema);