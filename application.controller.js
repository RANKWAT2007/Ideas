const Application = require("../models/Application");
const Job = require("../models/Job");


/**
 * APPLY FOR JOB (Jobseeker)
 * POST /api/applications/:jobId
 */
exports.applyJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        msg: "Job ID is required"
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        msg: "Job not found"
      });
    }

    // 🚫 Prevent duplicate apply
    const alreadyApplied = await Application.findOne({ jobId, userId });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        msg: "You already applied for this job"
      });
    }

    const application = await Application.create({
      jobId,
      userId,
      status: "applied" // ✅ ensure status set
    });

    res.status(201).json({
      success: true,
      msg: "Applied successfully",
      application
    });

  } catch (error) {
    console.error("❌ applyJob error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error while applying"
    });
  }
};



/**
 * UNAPPLY JOB
 */
exports.unapplyJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;

    await Application.findOneAndDelete({ jobId, userId });

    res.json({
      success: true,
      msg: "Application removed"
    });

  } catch (error) {
    console.error("❌ unapplyJob error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};



/**
 * CHECK IF ALREADY APPLIED
 */
exports.checkApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;

    const application = await Application.findOne({ jobId, userId });

    res.json({
      success: true,
      applied: !!application
    });

  } catch (error) {
    console.error("❌ checkApplication error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};



/**
 * GET APPLICANTS FOR A JOB (Recruiter Only)
 */
exports.getApplicants = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        msg: "Job not found"
      });
    }

    if (job.createdBy.toString() !== recruiterId.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Access denied"
      });
    }

    const applications = await Application.find({ jobId })
      .populate("userId", "name email") // ✅ name fix
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      totalApplicants: applications.length,
      applications
    });

  } catch (error) {
    console.error("❌ getApplicants error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};



/**
 * GET MY APPLICATIONS (Jobseeker)
 */
exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await Application.find({ userId })
      .populate("jobId", "title company location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      totalApplications: applications.length,
      applications
    });

  } catch (error) {
    console.error("❌ getMyApplications error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};



/**
 * ✅ NEW: GET ALL APPLICATIONS (Recruiter Dashboard)
 */
exports.getAllApplications = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    const jobs = await Job.find({ createdBy: recruiterId });
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({
      jobId: { $in: jobIds }
    })
      .populate("userId", "name email") // ✅ NAME WILL COME
      .populate("jobId", "title company")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });

  } catch (err) {
    console.error("❌ getAllApplications error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};



/**
 * ✅ NEW: UPDATE APPLICATION STATUS (Accept / Reject)
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid status"
      });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      msg: "Status updated",
      application
    });

  } catch (err) {
    console.error("❌ updateStatus error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};