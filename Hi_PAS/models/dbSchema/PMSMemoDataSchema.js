var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection); 

var PMSMemoDataSchema = new Schema({
    UID : Number,
    ToDoUID : Number, /* PMSToDoDataSchema UID */
    Content : String,
    MemoDate : { type: Date },
    MemoWriter : String
});

PMSMemoDataSchema.plugin(autoIncrement.plugin, {
    model: 'PMSMemoDataSchema',
    field: 'UID',
    startAt: 1
});

module.exports = mongoose.model('PMSMemoDataSchema', PMSMemoDataSchema, "PMSMemoData");