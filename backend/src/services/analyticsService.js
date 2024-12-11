const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");

// Event types for analytics
const EVENT_TYPES = {
  VIEW: "view",
  LIKE: "like",
  COMMENT: "comment",
  SHARE: "share",
  REPORT: "report",
  CLICK: "click",
  SEARCH: "search",
  LOGIN: "login",
  SIGNUP: "signup",
};

// Track user interaction with content
const trackEvent = async (eventType, data) => {
  try {
    const event = {
      type: eventType,
      timestamp: new Date(),
      ...data,
    };

    // Store event in analytics collection
    await mongoose.connection.collection("analytics_events").insertOne(event);

    // Update relevant metrics based on event type
    switch (eventType) {
      case EVENT_TYPES.VIEW:
        await updateViewMetrics(data);
        break;
      case EVENT_TYPES.LIKE:
        await updateEngagementMetrics(data, "likes");
        break;
      case EVENT_TYPES.COMMENT:
        await updateEngagementMetrics(data, "comments");
        break;
      case EVENT_TYPES.SHARE:
        await updateEngagementMetrics(data, "shares");
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
};

// Update view metrics for content
const updateViewMetrics = async ({ contentId, contentType, userId }) => {
  const update = {
    $inc: { "analytics.views": 1 },
    $addToSet: { "analytics.uniqueViewers": userId },
  };

  if (contentType === "post") {
    await Post.findByIdAndUpdate(contentId, update);
  }
};

// Update engagement metrics (likes, comments, shares)
const updateEngagementMetrics = async (
  { contentId, contentType, userId },
  metricType
) => {
  const update = {
    $inc: { [`analytics.${metricType}`]: 1 },
    $addToSet: {
      [`analytics.unique${
        metricType.charAt(0).toUpperCase() + metricType.slice(1)
      }`]: userId,
    },
  };

  if (contentType === "post") {
    await Post.findByIdAndUpdate(contentId, update);
  }
};

// Get content performance metrics
const getContentMetrics = async (contentId, contentType) => {
  try {
    let content;
    if (contentType === "post") {
      content = await Post.findById(contentId).select("analytics");
    }

    if (!content) {
      throw new Error("Content not found");
    }

    const events = await mongoose.connection
      .collection("analytics_events")
      .find({
        contentId: mongoose.Types.ObjectId(contentId),
        type: { $in: Object.values(EVENT_TYPES) },
      })
      .toArray();

    return {
      views: content.analytics.views || 0,
      uniqueViewers: content.analytics.uniqueViewers?.length || 0,
      likes: content.analytics.likes || 0,
      comments: content.analytics.comments || 0,
      shares: content.analytics.shares || 0,
      engagementRate: calculateEngagementRate(
        content.analytics.likes,
        content.analytics.comments,
        content.analytics.shares,
        content.analytics.views
      ),
      events: aggregateEvents(events),
    };
  } catch (error) {
    console.error("Error getting content metrics:", error);
    throw error;
  }
};

// Get user engagement metrics
const getUserMetrics = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const events = await mongoose.connection
      .collection("analytics_events")
      .find({
        userId: mongoose.Types.ObjectId(userId),
        type: { $in: Object.values(EVENT_TYPES) },
      })
      .toArray();

    const posts = await Post.find({ author: userId }).select("analytics");

    return {
      totalPosts: posts.length,
      totalViews: posts.reduce(
        (sum, post) => sum + (post.analytics.views || 0),
        0
      ),
      totalLikes: posts.reduce(
        (sum, post) => sum + (post.analytics.likes || 0),
        0
      ),
      totalComments: posts.reduce(
        (sum, post) => sum + (post.analytics.comments || 0),
        0
      ),
      totalShares: posts.reduce(
        (sum, post) => sum + (post.analytics.shares || 0),
        0
      ),
      averageEngagementRate: calculateAverageEngagementRate(posts),
      events: aggregateEvents(events),
    };
  } catch (error) {
    console.error("Error getting user metrics:", error);
    throw error;
  }
};

// Get trending content
const getTrendingContent = async (options = {}) => {
  try {
    const {
      timeframe = "day", // day, week, month
      limit = 10,
      contentType = "post",
    } = options;

    const timeframeMap = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const startTime = new Date(Date.now() - timeframeMap[timeframe]);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startTime },
        },
      },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $ifNull: ["$analytics.likes", 0] },
              { $multiply: [{ $ifNull: ["$analytics.comments", 0] }, 2] },
              { $multiply: [{ $ifNull: ["$analytics.shares", 0] }, 3] },
            ],
          },
        },
      },
      {
        $sort: { engagementScore: -1 },
      },
      {
        $limit: limit,
      },
    ];

    let trending;
    if (contentType === "post") {
      trending = await Post.aggregate(pipeline);
    }

    return trending;
  } catch (error) {
    console.error("Error getting trending content:", error);
    throw error;
  }
};

// Helper function to calculate engagement rate
const calculateEngagementRate = (
  likes = 0,
  comments = 0,
  shares = 0,
  views = 0
) => {
  if (views === 0) return 0;
  return ((likes + comments * 2 + shares * 3) / views) * 100;
};

// Helper function to calculate average engagement rate
const calculateAverageEngagementRate = (posts) => {
  if (posts.length === 0) return 0;

  const totalEngagementRate = posts.reduce((sum, post) => {
    return (
      sum +
      calculateEngagementRate(
        post.analytics.likes,
        post.analytics.comments,
        post.analytics.shares,
        post.analytics.views
      )
    );
  }, 0);

  return totalEngagementRate / posts.length;
};

// Helper function to aggregate events by type
const aggregateEvents = (events) => {
  return events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
};

module.exports = {
  EVENT_TYPES,
  trackEvent,
  getContentMetrics,
  getUserMetrics,
  getTrendingContent,
};
