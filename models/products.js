// models/user.model.js
// load những thư viện chúng ta cần
var mongoose = require("mongoose");

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var products = new Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  cateID: { type: String, required: false },
  providerID: { type: String, required: false },
  sizeId: [{ type: String, required: false }],
  colorId: [{ type: String, required: false }],
  quantity: { type: Number, required: true },
  note: { type: String, required: true },
  price: { type: String, required: true },
  date: { type: Date, required: true },
});

module.exports = mongoose.model("products", products);
