const User = require("../models/User");
const Organization = require("../models/Organization");
const Post = require("../models/Post");
const Message = require("../models/Message");
const Survey = require("../models/Survey");
const LocalService = require("../models/LocalService");
const Notification = require("../models/Notification");
const ImpactMetric = require("../models/ImpactMetric");

// Get citizen dashboard stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      followedOrgs,
      nearbyOrgs,
      participatedPosts,
      savedPosts,
      messages,
      notifications,
    ] = await Promise.all([
      Organization.countDocuments({ followers: userId }),
      Organization.countDocuments({
        "contact.address.county": req.user.county,
      }),
      Post.countDocuments({ participants: userId }),
      Post.countDocuments({ savedBy: userId }),
      Message.aggregate([
        {
          $match: {
            recipient: userId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: {
              $sum: {
                $cond: [{ $eq: ["$read", false] }, 1, 0],
              },
            },
          },
        },
      ]),
      Notification.countDocuments({
        user: userId,
        read: false,
      }),
    ]);

    res.json({
      organizations: {
        following: followedOrgs,
        nearby: nearbyOrgs,
      },
      posts: {
        participated: participatedPosts,
        saved: savedPosts,
      },
      messages: {
        total: messages[0]?.total || 0,
        unread: messages[0]?.unread || 0,
      },
      notifications: {
        unread: notifications,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const activities = await Promise.all([
      // Get recent posts from followed organizations
      Post.find({
        organization: { $in: req.user.followedOrganizations },
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("organization", "name type"),

      // Get recent forum interactions
      Post.find({
        $or: [
          { author: userId },
          { participants: userId },
          { savedBy: userId },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("author", "name"),

      // Get recent messages
      Message.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("sender", "name"),
    ]);

    // Combine and sort all activities by date
    const allActivities = activities
      .flat()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    res.json({
      activities: allActivities,
      page: parseInt(page),
      totalPages: Math.ceil(allActivities.length / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get followed organizations
exports.getFollowedOrganizations = async (req, res) => {
  try {
    const userId = req.user._id;
    const organizations = await Organization.find({
      followers: userId,
    }).select("name type description contact.address focus verified");

    res.json({ organizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nearby organizations
exports.getNearbyOrganizations = async (req, res) => {
  try {
    const { county, constituency } = req.query;
    const query = {
      "contact.address.county": county,
    };

    if (constituency) {
      query["contact.address.constituency"] = constituency;
    }

    const organizations = await Organization.find(query).select(
      "name type description contact.address focus verified"
    );

    res.json({ organizations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Follow/unfollow organization
exports.toggleFollowOrganization = async (req, res) => {
  try {
    const userId = req.user._id;
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isFollowing = organization.followers.includes(userId);
    if (isFollowing) {
      organization.followers.pull(userId);
      await User.findByIdAndUpdate(userId, {
        $pull: { followedOrganizations: organizationId },
      });
    } else {
      organization.followers.push(userId);
      await User.findByIdAndUpdate(userId, {
        $push: { followedOrganizations: organizationId },
      });
    }

    await organization.save();
    res.json({ isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ savedBy: userId })
      .sort({ createdAt: -1 })
      .populate("author", "name")
      .populate("organization", "name");

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save/unsave post
exports.toggleSavePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isSaved = post.savedBy.includes(userId);
    if (isSaved) {
      post.savedBy.pull(userId);
    } else {
      post.savedBy.push(userId);
    }

    await post.save();
    res.json({ isSaved: !isSaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get local services
exports.getLocalServices = async (req, res) => {
  try {
    const { county, constituency, category } = req.query;
    const query = { county };

    if (constituency) query.constituency = constituency;
    if (category) query.category = category;

    const services = await LocalService.find(query)
      .populate("organization", "name contact")
      .sort({ createdAt: -1 });

    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available surveys
exports.getSurveys = async (req, res) => {
  try {
    const userId = req.user._id;
    const surveys = await Survey.find({
      endDate: { $gt: new Date() },
      "responses.user": { $ne: userId },
    }).populate("organization", "name");

    res.json({ surveys });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit survey response
exports.submitSurvey = async (req, res) => {
  try {
    const userId = req.user._id;
    const { surveyId } = req.params;
    const { responses } = req.body;

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    if (survey.endDate < new Date()) {
      return res.status(400).json({ message: "Survey has ended" });
    }

    survey.responses.push({
      user: userId,
      answers: responses,
      submittedAt: new Date(),
    });

    await survey.save();
    res.json({ message: "Survey response submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get impact data
exports.getImpactData = async (req, res) => {
  try {
    const { county, constituency, category, timeframe } = req.query;
    const query = {};

    if (county) query.county = county;
    if (constituency) query.constituency = constituency;
    if (category) query.category = category;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - (timeframe || 12));

    query.date = { $gte: startDate, $lte: endDate };

    const metrics = await ImpactMetric.find(query)
      .populate("organization", "name")
      .sort({ date: -1 });

    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "name")
      .populate("relatedContent");

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    );

    res.json({ preferences: user.notificationPreferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
