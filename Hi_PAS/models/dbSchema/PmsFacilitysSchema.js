var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PmsFacilitysSchema = new Schema({
    FacilityId: { type: String, default: '-' },
    BarCode: { type: String, default: '-' }
});

module.exports = mongoose.model('PmsFacilitysSchema', PmsFacilitysSchema);