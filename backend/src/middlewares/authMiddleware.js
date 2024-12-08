const { verifyToken } = require("../utils/tokenUtils");
const User = require("../models/User");

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = await User.findById(payload.userId).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication invalid" });
  }
};

module.exports = { authenticateUser };
