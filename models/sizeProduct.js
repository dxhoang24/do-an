// models/user.model.js
// load những thư viện chúng ta cần
var mongoose = require("mongoose");

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var sizeProduct = new Schema({
  productId: { type: String, required: false },
  quantity: { type: Number, required: false },
  size: { type: String, required: false },
  status: {type: Number, default:1},
});

module.exports = mongoose.model("sizeProduct", sizeProduct);
