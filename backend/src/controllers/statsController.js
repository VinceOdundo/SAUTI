const User = require("../models/User");
const Post = require("../models/Post");
const Organization = require("../models/Organization");

// Get public stats for landing page
exports.getPublicStats = async (req, res) => {
  try {
    const [users, posts, organizations] = await Promise.all([
      User.countDocuments({ emailVerified: true, verificationStatus: 'approved' }),
      Post.countDocuments({ status: "active" }),
      Organization.countDocuments({ verified: true }),
    ]);

    // Calculate engagement rate (example: percentage of users who have made posts)
    const activeUsers = await User.countDocuments({
      _id: { $in: await Post.distinct("author") },
      emailVerified: true,
      verificationStatus: 'approved'
    });
    const engagementRate =
      users > 0 ? Math.round((activeUsers / users) * 100) : 0;

    res.json({
      users,
      posts,
      communities: organizations,
      engagementRate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
