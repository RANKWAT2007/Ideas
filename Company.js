const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Company", companySchema);
