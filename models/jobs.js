var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var Jobs = new Schema(
  {
    file: { type: String, required: true },
    fileOut: { type: String },
    job_status: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "jobs" }
);

module.exports = mongoose.model("Job", Jobs);
