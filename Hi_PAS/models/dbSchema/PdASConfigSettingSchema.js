var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PdASConfigSettingSchema = new Schema({
    CurrentTime: Date,
    CurrentData: {
        Threshold: [],
        UpperLimit: Number
    },
    OEEData: {
        Threshold: [],
        LowerLimit: Number        
    }    
});

module.exports = mongoose.model('PdASConfigSettingSchema', PdASConfigSettingSchema, 'PdASConfigSettingData');