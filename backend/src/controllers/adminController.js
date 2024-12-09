const User = require("../models/User");
const Organization = require("../models/Organization");
const Representative = require("../models/Representative");
const Post = require("../models/Post");
const Message = require("../models/Message");
const Report = require("../models/Report");

// Get admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [
      userStats,
      orgStats,
      repStats,
      postStats,
      messageStats,
      reportStats,
    ] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: {
              $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$verified", false] }, 1, 0] },
            },
          },
        },
      ]),
      Organization.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: {
              $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$verified", false] }, 1, 0] },
            },
          },
        },
      ]),
      Representative.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: {
              $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$verified", false] }, 1, 0] },
            },
          },
        },
      ]),
      Post.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            reported: {
              $sum: { $cond: [{ $gt: ["$reports", 0] }, 1, 0] },
            },
          },
        },
      ]),
      Message.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            today: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$createdAt",
                      new Date(new Date().setHours(0, 0, 0, 0)),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Report.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    res.json({
      users: userStats[0] || { total: 0, verified: 0, pending: 0 },
      organizations: orgStats[0] || { total: 0, verified: 0, pending: 0 },
      representatives: repStats[0] || { total: 0, verified: 0, pending: 0 },
      posts: postStats[0] || { total: 0, reported: 0 },
      messages: messageStats[0] || { total: 0, today: 0 },
      reports: reportStats[0] || { total: 0, pending: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get activity trends
exports.getActivityTrends = async (req, res) => {
  try {
    const { timeRange } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const [userActivity, postActivity, messageActivity] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: timeRange === "year" ? "%Y-%m" : "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Post.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: timeRange === "year" ? "%Y-%m" : "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Message.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: timeRange === "year" ? "%Y-%m" : "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      userActivity,
      postActivity,
      messageActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get verification requests
exports.getVerificationRequests = async (req, res) => {
  try {
    const { type = "all", status = "pending" } = req.query;
    const query = { status };

    let requests = [];
    if (type === "all" || type === "organization") {
      const orgRequests = await Organization.find({
        ...query,
        verified: false,
      }).populate("representatives.user", "name email");
      requests = [
        ...requests,
        ...orgRequests.map((org) => ({ ...org._doc, type: "organization" })),
      ];
    }

    if (type === "all" || type === "representative") {
      const repRequests = await Representative.find({
        ...query,
        verified: false,
      })
        .populate("user", "name email")
        .populate("organization", "name");
      requests = [
        ...requests,
        ...repRequests.map((rep) => ({ ...rep._doc, type: "representative" })),
      ];
    }

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify document
exports.verifyDocument = async (req, res) => {
  try {
    const { requestId, documentName, verified } = req.body;
    const { type } = req.query;

    let request;
    if (type === "organization") {
      request = await Organization.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Organization not found" });
      }

      request.verificationDocuments[documentName].verified = verified;
      await request.save();
    } else if (type === "representative") {
      request = await Representative.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Representative not found" });
      }

      request.verificationDocuments[documentName].verified = verified;
      await request.save();
    }

    res.json({ message: "Document verification status updated", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reported content
exports.getReportedContent = async (req, res) => {
  try {
    const { type = "all", status = "pending" } = req.query;
    const query = { status };

    let reports = [];
    if (type === "all" || type === "post") {
      const postReports = await Report.find({
        ...query,
        contentType: "post",
      })
        .populate("content", "title text author")
        .populate("reportedBy", "name");
      reports = [...reports, ...postReports];
    }

    if (type === "all" || type === "user") {
      const userReports = await Report.find({
        ...query,
        contentType: "user",
      })
        .populate("content", "name email")
        .populate("reportedBy", "name");
      reports = [...reports, ...userReports];
    }

    if (type === "all" || type === "comment") {
      const commentReports = await Report.find({
        ...query,
        contentType: "comment",
      })
        .populate("content", "text author")
        .populate("reportedBy", "name");
      reports = [...reports, ...commentReports];
    }

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Moderate reported content
exports.moderateContent = async (req, res) => {
  try {
    const { reportId, action } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    report.status = action;
    await report.save();

    // Handle content based on action
    switch (action) {
      case "removed":
        if (report.contentType === "post") {
          await Post.findByIdAndUpdate(report.content, { status: "removed" });
        } else if (report.contentType === "user") {
          await User.findByIdAndUpdate(report.content, { status: "suspended" });
        }
        break;
      case "warning":
        if (report.contentType === "user") {
          const user = await User.findById(report.content);
          user.warnings = (user.warnings || 0) + 1;
          await user.save();
        }
        break;
    }

    res.json({ message: "Content moderated successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users for management
exports.getUsers = async (req, res) => {
  try {
    const {
      role = "all",
      status = "all",
      verified = "all",
      search = "",
    } = req.query;
    const query = {};

    if (role !== "all") query.role = role;
    if (status !== "all") query.status = status;
    if (verified !== "all") query.verified = verified === "verified";

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("organization", "name");

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manage user
exports.manageUser = async (req, res) => {
  try {
    const { userId, action } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    switch (action) {
      case "suspend":
        user.status = "suspended";
        break;
      case "activate":
        user.status = "active";
        break;
      case "warn":
        user.warnings = (user.warnings || 0) + 1;
        break;
      case "reset":
        // Generate and send reset password email
        // Implementation depends on your password reset flow
        break;
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("organization", "name");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
