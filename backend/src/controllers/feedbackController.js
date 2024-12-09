const Feedback = require("../models/Feedback");
const Representative = require("../models/Representative");
const sanitizeHtml = require("sanitize-html");

const createFeedback = async (req, res) => {
  try {
    const { representativeId, title, content, category, visibility } = req.body;

    // Input validation
    if (!title?.trim() || !content?.trim() || !category || !representativeId) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["title", "content", "category", "representativeId"],
      });
    }

    // Sanitize inputs
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: ["b", "i", "em", "strong", "a"],
      allowedAttributes: {
        a: ["href"],
      },
    });

    // Rate limiting check
    const userFeedbackCount = await Feedback.countDocuments({
      author: req.user._id,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (userFeedbackCount >= 10) {
      return res.status(429).json({
        message: "Feedback limit reached. Please try again later.",
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    const representative = await Representative.findById(representativeId);
    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    // Create feedback with sanitized content
    const feedback = await Feedback.create({
      author: req.user._id,
      representative: representativeId,
      title: title.trim(),
      content: sanitizedContent,
      category,
      visibility: visibility || "public",
      metadata: {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    });

    await feedback.populate([
      { path: "author", select: "name avatar" },
      {
        path: "representative",
        populate: { path: "user", select: "name avatar" },
      },
    ]);

    res.status(201).json({ feedback });
  } catch (error) {
    res.status(500).json({
      message: "Error creating feedback",
      error: error.message,
    });
  }
};

const getFeedback = async (req, res) => {
  try {
    const {
      representativeId,
      category,
      status,
      visibility,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (representativeId) query.representative = representativeId;
    if (category) query.category = category;
    if (status) query.status = status;
    if (visibility) query.visibility = visibility;

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar")
      .populate({
        path: "representative",
        populate: { path: "user", select: "name avatar" },
      });

    const total = await Feedback.countDocuments(query);

    res.json({
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching feedback",
      error: error.message,
    });
  }
};

const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Check if user is the representative
    const representative = await Representative.findOne({ user: req.user._id });
    if (
      !representative ||
      !representative._id.equals(feedback.representative)
    ) {
      return res.status(403).json({ message: "Unauthorized to respond" });
    }

    feedback.response = {
      content: response,
      respondedAt: new Date(),
      respondedBy: req.user._id,
    };
    feedback.status = status;

    await feedback.save();
    res.json({ feedback });
  } catch (error) {
    res.status(500).json({
      message: "Error responding to feedback",
      error: error.message,
    });
  }
};

module.exports = {
  createFeedback,
  getFeedback,
  respondToFeedback,
};
