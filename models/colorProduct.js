// models/user.model.js
// load những thư viện chúng ta cần
var mongoose = require("mongoose");

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var colorProduct = new Schema({
  color: { type: String, required: false },
  status: {type: Number, default:1},
});

module.exports = mongoose.model("colorProduct", colorProduct);
