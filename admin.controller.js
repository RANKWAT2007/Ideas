const User = require("../models/User");
const Job = require("../models/Job");

/**
 * Get simple admin stats
 */
exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const jobs = await Job.countDocuments();

    res.status(200).json({ success: true, stats: { users, jobs } });
  } catch (error) {
    console.error("❌ getStats error:", error);
    res.status(500).json({ success: false, msg: "Server error while fetching stats" });
  }
};
