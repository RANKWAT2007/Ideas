const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ["applied", "accepted", "rejected"],
    default: "applied"
  }

}, { timestamps: true });

applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);