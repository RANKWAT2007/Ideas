const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  fullName: String,
  phone: String,
  location: String,
  skills: String,
  experience: String,
  education: String,
  resume: String
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);
 