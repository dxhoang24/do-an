// models/user.model.js
// load những thư viện chúng ta cần
var mongoose = require("mongoose");

// định nghĩ cấu trúc user model
var Schema = mongoose.Schema;
var providers = new Schema({
  nameprovider: { type: String, required: false },
  phone: { type: Number, required: false },
  email: { type: String, required: false },
  address: { type: String, required: false },
  status: {type: Number, default:1},
});

module.exports = mongoose.model("providers", providers);
