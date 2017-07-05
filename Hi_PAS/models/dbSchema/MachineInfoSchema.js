var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MachineInfoSchema = new Schema({
    Type: String,
    Name: String,
    ID  : Number
});

module.exports = mongoose.model('MachineInfoSchema', MachineInfoSchema);