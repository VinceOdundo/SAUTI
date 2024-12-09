const Representative = require("../models/Representative");
const User = require("../models/User");
const Feedback = require("../models/Feedback");

const getRepresentatives = async (req, res) => {
  try {
    const { county, constituency, ward, position } = req.query;
    const query = {};

    if (county) query.county = county;
    if (constituency) query.constituency = constituency;
    if (ward) query.ward = ward;
    if (position) query.position = position;

    const representatives = await Representative.find(query)
      .populate("user", "name avatar email")
      .sort({ position: 1, county: 1, constituency: 1, ward: 1 });

    res.json({ representatives });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching representatives",
      error: error.message,
    });
  }
};

const getRepresentativeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const representative = await Representative.findById(id)
      .populate("user", "name avatar email")
      .populate({
        path: "posts",
        select: "title content createdAt votes",
        options: { sort: { createdAt: -1 }, limit: 5 },
      });

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    res.json({ representative });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching representative profile",
      error: error.message,
    });
  }
};

const updateRepresentativeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ensure user can only update their own profile
    const representative = await Representative.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    // Remove protected fields from updates
    delete updates.verified;
    delete updates.user;

    Object.assign(representative, updates);
    await representative.save();

    res.json({ representative });
  } catch (error) {
    res.status(500).json({
      message: "Error updating representative profile",
      error: error.message,
    });
  }
};

const getRepresentativeAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const representative = await Representative.findById(id);

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    // Get all feedback for the representative
    const feedback = await Feedback.find({ representative: id });

    // Calculate response rate
    const respondedFeedback = feedback.filter((f) => f.response);
    const responseRate =
      (respondedFeedback.length / feedback.length) * 100 || 0;

    // Calculate average response time
    const responseTimes = respondedFeedback.map((f) => {
      const created = new Date(f.createdAt);
      const responded = new Date(f.response.respondedAt);
      return (responded - created) / (1000 * 60 * 60); // Convert to hours
    });
    const averageResponseTime =
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;

    // Group feedback by category
    const feedbackByCategory = await Feedback.aggregate([
      { $match: { representative: representative._id } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);

    // Group feedback by month
    const feedbackByMonth = await Feedback.aggregate([
      { $match: { representative: representative._id } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.month" },
              "/",
              { $toString: "$_id.year" },
            ],
          },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.json({
      responseRate,
      averageResponseTime,
      feedbackByCategory,
      feedbackByMonth,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getRepresentatives,
  getRepresentativeProfile,
  updateRepresentativeProfile,
  getRepresentativeAnalytics,
};
