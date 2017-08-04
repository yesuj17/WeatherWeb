var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/******* State(임시) *******
* 미점검: 0
* 미조치: 1
* 점검: 2
*********************************/
var TodoListSchema = new Schema({
    StartDate: Date,
    TodoList: [{
        _id: false,
        FacilityId: Number,
        Code: String,
        CheckDate: { type: Date, default: null },
        Level: Number,
        Title: { type: String, default: '-' },
        Content: { type: String, default: '-' },
        LargeCategory: { type: String, default: '-' },
        MediumCategory: { type: String, default: '-' },
        SmallCategory: { type: String, default: '-' },
        TimeGroup: Number,
        TimeBaseUnit: Number,
        TimeBaseValue: Number,
        MemoListID: { type: Number, default: 0 },
        FileListID: { type: Number, default: 0 },
        Result: { type: String, default: null },
        ActionDate: { type: Date, default: null },
        State: { type: Number, default: 0 },
        Relation: []
    }]
});

module.exports = mongoose.model('TodoListSchema', TodoListSchema, "TodoList");