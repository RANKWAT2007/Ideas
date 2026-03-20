const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open"
    },

    // ✅ store applicants (jobseeker ids)
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);


// ✅ Prevent duplicate applicants (same user apply multiple times)
jobSchema.methods.addApplicant = function(userId) {
  if (!this.applicants.includes(userId)) {
    this.applicants.push(userId);
  }
};

// ✅ Remove applicant (for unapply)
jobSchema.methods.removeApplicant = function(userId) {
  this.applicants = this.applicants.filter(
    id => id.toString() !== userId.toString()
  );
};


module.exports = mongoose.model("Job", jobSchema);