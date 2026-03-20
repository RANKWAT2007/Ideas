const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const auth = require("../middlewares/auth.middleware");

// ===============================
// CREATE / UPDATE PROFILE
// ===============================
router.post("/", auth, async (req, res) => {
  try {
    const {
      fullName,
      phone,
      location,
      skills,
      experience,
      education,
      resume
    } = req.body;

    const profileData = {
      user: req.user.id,
      fullName,
      phone,
      location,
      skills: Array.isArray(skills)
        ? skills
        : skills?.split(",").map(s => s.trim()),
      experience,
      education,
      resume
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileData },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Profile saved successfully",
      profile
    });

  } catch (err) {
    console.error("PROFILE SAVE ERROR:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while saving profile"
    });
  }
});

// ===============================
// GET PROFILE
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        msg: "Profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });

  } catch (err) {
    console.error("PROFILE FETCH ERROR:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching profile"
    });
  }
});

module.exports = router;
