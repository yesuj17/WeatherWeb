var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose.connection); 

var PMSFileDataSchema = new Schema({
    UID : Number,
    ToDoUID : Number, /* PMSToDoDataSchema UID */
    FileName : String,
    FileType : Number, /* 0 : Image, 1 : Binary */
    FileDate : { type: Date ,default: Date.now},
    FileWriter : String
});

PMSFileDataSchema.plugin(autoIncrement.plugin, {
    model: 'PMSFileDataSchema',
    field: 'UID',
    startAt: 1
});

module.exports = mongoose.model('PMSFileDataSchema', PMSFileDataSchema, "PMSFileData");