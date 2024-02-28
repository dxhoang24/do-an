var mongoose = require("mongoose");

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var city = new Schema({
  name: { type: String},
});

module.exports = mongoose.model("city", city);
