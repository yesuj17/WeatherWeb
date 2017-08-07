var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMScheckSchema = new Schema({
    Code_FacilityId: { type: String, default: '-' },
    CreateDate: { type: Date, default: Date.now },
    TimeGroup: { type: String, default: '-' },
    TimeBaseUnit: { type: String, default: '-' },
    TimeBaseValue: { type: String, default: '-' },
    nonTimeVaseMainUnit: { type: String, default: '-' },
    nonTimeBaseMainValue: { type: Number, default: 0 },
    nonTimeBaseWarringUnit: { type: String, default: '-' },
    nonTimeBaseWarringValue: { type: Number, default: 0 },
    Relation: [],
});

module.exports = mongoose.model('PMScheckSchema', PMScheckSchema);