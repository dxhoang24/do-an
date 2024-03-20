var mongoose = require("mongoose");

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var district = new Schema({
  cityId: { type: String},
  name: { type: String},
});

module.exports = mongoose.model("district", district);
