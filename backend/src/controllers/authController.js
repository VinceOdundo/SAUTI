const User = require("../models/User");
const { createToken } = require("../utils/tokenUtils");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const user = await User.create(req.body);
    const token = createToken({ userId: user._id });
    res
      .status(201)
      .json({ user: { name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = createToken({ userId: user._id });
    res.json({ user: { name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  res.json({ user: req.user });
};
