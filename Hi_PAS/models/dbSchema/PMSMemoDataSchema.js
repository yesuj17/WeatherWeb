var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSMemoDataSchema = new Schema({
    UID : Number,
    ToDoUID : Number, /* PMSToDoDataSchema UID */
    Content : String     
});

module.exports = mongoose.model('PMSMemoDataSchema', PMSMemoDataSchema, "PMSMemoData");