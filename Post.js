const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  text: {
    type: String
  },
  media: [
    {
      type: String // file path
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);