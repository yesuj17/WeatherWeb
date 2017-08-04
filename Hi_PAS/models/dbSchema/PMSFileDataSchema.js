var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PMSFileDataSchema = new Schema({
    UID : Number,
    ToDoUID : Number, /* PMSToDoDataSchema UID */
    FileName : String,
    FileType : Number, /* 0 : Image, 1 : Binary */
    Data : String
});

module.exports = mongoose.model('PMSFileDataSchema', PMSFileDataSchema, "PMSFileData");