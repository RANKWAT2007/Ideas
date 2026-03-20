// controllers/auth.controller.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(), // always lowercase
      password: hashedPassword,
      role
    });

    res.json({ msg: "User registered successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", success: false });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "User not found", success: false });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong password", success: false });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, role: user.role, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", success: false });
  }
};
