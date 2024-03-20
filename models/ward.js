var mongoose = require("mongoose");

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var ward = new Schema({
  districtId: { type: String},
  name: { type: String},
});

module.exports = mongoose.model("ward", ward);
