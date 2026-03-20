const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User"); // ✅ TOP pe hi require


/**
 * CREATE JOB (Recruiter only)
 */
exports.createJob = async (req, res) => {
  try {
    const { title, company, location, description } = req.body;
    const recruiterId = req.user?.id;

    if (!recruiterId) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }

    const job = await Job.create({
      title,
      company,
      location,
      description,
      createdBy: recruiterId
    });

    res.status(201).json({ success: true, job });

  } catch (error) {
    console.error("❌ createJob error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * GET ALL JOBS
 */
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ success: true, jobs });

  } catch (error) {
    console.error("❌ getJobs error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * GET MY JOBS
 */
exports.getMyJobs = async (req, res) => {
  try {
    const recruiterId = req.user?.id;

    if (!recruiterId) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }

    const jobs = await Job.find({ createdBy: recruiterId })
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });

  } catch (error) {
    console.error("❌ getMyJobs error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * DELETE JOB
 */
exports.deleteJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const jobId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, msg: "Job not found" });
    }

    if (job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    // delete applications
    await Application.deleteMany({ jobId });

    await Job.findByIdAndDelete(jobId);

    res.json({ success: true, msg: "Job deleted successfully" });

  } catch (error) {
    console.error("❌ deleteJob error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * APPLY JOB
 */

exports.applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    // Find job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, msg: "Job not found" });
    }

    // Check if already applied in Application collection
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({ success: false, msg: "Already applied" });
    }

    // Get user details
    const user = await User.findById(userId);

    // Create application
    const application = await Application.create({
      jobId,
      userId,
      name: user?.name || "User",
      email: user?.email || "",
      status: "applied"
    });

    // Avoid duplicate applicants in Job model
    const alreadyExists = job.applicants.some(
      (id) => id.toString() === userId.toString()
    );

    if (!alreadyExists) {
      job.applicants.push(userId);
      await job.save();
    }

    return res.status(201).json({
      success: true,
      application,
      msg: "Applied successfully"
    });

  } catch (err) {
    console.error("❌ applyJob error:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

/**
 * UNAPPLY JOB
 */
exports.unapplyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    await Application.findOneAndDelete({ jobId, userId });

    // ✅ remove from applicants array also
    await Job.findByIdAndUpdate(jobId, {
      $pull: { applicants: userId }
    });

    res.json({ success: true, msg: "Application removed" });

  } catch (err) {
    console.error("❌ unapplyJob error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * GET MY APPLIED JOBS
 */
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await Application.find({ userId });

    const jobIds = applications.map(app => app.jobId);

    const jobs = await Job.find({ _id: { $in: jobIds } });

    res.json({
      success: true,
      jobs
    });

  } catch (error) {
    console.error("❌ getMyApplications error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * GET APPLICANTS (single job)
 */
exports.getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, msg: "Job not found" });
    }

    if (job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }

    const applications = await Application.find({ jobId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
      totalApplicants: applications.length
    });

  } catch (error) {
    console.error("❌ getApplicants error:", error);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * GET ALL APPLICATIONS (Recruiter Dashboard)
 */
exports.getAllApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ createdBy: recruiterId });
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({
      jobId: { $in: jobIds }
    })
      .populate("userId", "name email")
      .populate("jobId", "title company")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });

  } catch (err) {
    console.error("❌ getAllApplications error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


/**
 * UPDATE STATUS (Accept / Reject)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid status"
      });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      msg: "Status updated",
      app
    });

  } catch (err) {
    console.error("❌ updateStatus error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};