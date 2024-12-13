const Representative = require("../models/Representative");
const User = require("../models/User");
const Interaction = require("../models/Interaction");
const {
  validateRepresentative,
  validateInteraction,
} = require("../validators/representativeValidator");
const { sendCitizenRequestNotification, sendRepresentativeResponseNotification } = require("../services/emailService");

exports.registerRepresentative = async (req, res, next) => {
  try {
    const { error } = validateRepresentative(req.body);
    if (error) {
      return res.sendError(error.details[0].message);
    }

    const existingRep = await Representative.findOne({ user: req.user.id });
    if (existingRep) {
      return res.sendError("User is already a representative", 400);
    }

    const representative = new Representative({
      ...req.body,
      user: req.user.id,
      verificationStatus: "pending",
    });

    await representative.save();
    await User.findByIdAndUpdate(req.user.id, { role: "representative" });
    await representative.populate("user", "name email avatar");

    res.sendSuccess(
      representative,
      "Representative profile created successfully"
    );
  } catch (err) {
    next(err);
  }
};

exports.verifyRepresentative = async (req, res, next) => {
  try {
    const representative = await Representative.findById(
      req.params.representativeId
    );
    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    representative.verificationStatus = "verified";
    await representative.save();

    res.sendSuccess(representative, "Representative verified successfully");
  } catch (err) {
    next(err);
  }
};

exports.getRepresentative = async (req, res, next) => {
  try {
    const representative = await Representative.findById(
      req.params.representativeId
    )
      .populate("user", "name email avatar")
      .populate({
        path: "reviews",
        populate: { path: "author", select: "name avatar" },
      });

    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    res.sendSuccess(representative);
  } catch (err) {
    next(err);
  }
};

exports.updateRepresentative = async (req, res, next) => {
  try {
    const { error } = validateRepresentative(req.body);
    if (error) {
      return res.sendError(error.details[0].message);
    }

    const representative = await Representative.findOneAndUpdate(
      { _id: req.params.representativeId, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("user", "name email avatar");

    if (!representative) {
      return res.sendError("Representative not found or unauthorized", 404);
    }

    res.sendSuccess(
      representative,
      "Representative profile updated successfully"
    );
  } catch (err) {
    next(err);
  }
};

exports.followRepresentative = async (req, res, next) => {
  try {
    const representative = await Representative.findById(
      req.params.representativeId
    );
    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    if (!representative.followers.includes(req.user.id)) {
      representative.followers.push(req.user.id);
      await representative.save();
    }

    res.sendSuccess(representative, "Representative followed successfully");
  } catch (err) {
    next(err);
  }
};

exports.unfollowRepresentative = async (req, res, next) => {
  try {
    const representative = await Representative.findById(
      req.params.representativeId
    );
    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    representative.followers = representative.followers.filter(
      (id) => id.toString() !== req.user.id.toString()
    );
    await representative.save();

    res.sendSuccess(representative, "Representative unfollowed successfully");
  } catch (err) {
    next(err);
  }
};

exports.getRepresentativeStats = async (req, res, next) => {
  try {
    const representative = await Representative.findOne({
      user: req.user.id,
    }).populate("followers");

    if (!representative) {
      return res.sendError("Representative profile not found", 404);
    }

    const stats = {
      followersCount: representative.followers.length,
      reviewsCount: representative.reviews.length,
      averageRating: representative.averageRating,
    };

    res.sendSuccess(stats);
  } catch (err) {
    next(err);
  }
};

exports.getRepresentatives = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { verificationStatus: "verified" };

    // Apply filters
    if (req.query.county) query.county = req.query.county;
    if (req.query.constituency) query.constituency = req.query.constituency;
    if (req.query.ward) query.ward = req.query.ward;

    const [representatives, total] = await Promise.all([
      Representative.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email avatar")
        .lean(),
      Representative.countDocuments(query),
    ]);

    res.sendSuccess({
      representatives,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getRepresentativeProfile = async (req, res, next) => {
  try {
    const representative = await Representative.findById(req.params.id)
      .populate("user", "name email avatar")
      .populate({
        path: "reviews",
        populate: { path: "author", select: "name avatar" },
      });

    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    res.sendSuccess(representative);
  } catch (err) {
    next(err);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.sendError("Rating must be between 1 and 5");
    }

    const representative = await Representative.findById(req.params.id);
    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    // Check if user has already reviewed
    const existingReview = representative.reviews.find(
      (review) => review.author.toString() === req.user.id
    );

    if (existingReview) {
      return res.sendError(
        "You have already reviewed this representative",
        400
      );
    }

    representative.reviews.push({
      author: req.user.id,
      rating,
      comment,
    });

    // Update average rating
    const totalRating = representative.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    representative.averageRating = totalRating / representative.reviews.length;

    await representative.save();
    await representative.populate({
      path: "reviews.author",
      select: "name avatar",
    });

    res.sendSuccess(representative, "Review added successfully");
  } catch (err) {
    next(err);
  }
};

// Get representative's interactions with citizens
exports.getInteractions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { representative: req.params.representativeId };
    if (status) query.status = status;

    const interactions = await Interaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("citizen", "name email avatar")
      .populate("representative", "user")
      .populate("messages.sender", "name email avatar");

    const total = await Interaction.countDocuments(query);

    res.sendSuccess({
      interactions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// Handle citizen request
exports.handleCitizenRequest = async (req, res, next) => {
  try {
    const { status, response, category } = req.body;
    const interaction = await Interaction.findById(req.params.interactionId)
      .populate("citizen")
      .populate("representative");

    if (!interaction) {
      return res.sendError("Interaction not found", 404);
    }

    if (interaction.representative.toString() !== req.user.id) {
      return res.sendError("Unauthorized to handle this request", 403);
    }

    interaction.status = status;
    interaction.category = category || interaction.category;
    interaction.messages.push({
      sender: req.user.id,
      content: response,
      type: "response",
    });

    await interaction.save();

    // Send email notification to citizen
    await sendRepresentativeResponseNotification(
      interaction.citizen,
      req.user,
      status
    );

    res.sendSuccess(interaction, "Request handled successfully");
  } catch (err) {
    next(err);
  }
};

// Get representative's schedule
exports.getSchedule = async (req, res, next) => {
  try {
    const representative = await Representative.findById(req.params.representativeId)
      .populate("schedule.appointments.citizen", "name email avatar");

    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    res.sendSuccess(representative.schedule);
  } catch (err) {
    next(err);
  }
};

// Update availability
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    const representative = await Representative.findOneAndUpdate(
      { _id: req.params.representativeId, user: req.user.id },
      { $set: { "schedule.availability": availability } },
      { new: true }
    );

    if (!representative) {
      return res.sendError("Representative not found or unauthorized", 404);
    }

    res.sendSuccess(representative.schedule, "Availability updated successfully");
  } catch (err) {
    next(err);
  }
};

// Schedule appointment
exports.scheduleAppointment = async (req, res, next) => {
  try {
    const { date, time, purpose } = req.body;
    const representative = await Representative.findById(req.params.representativeId);

    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    // Check if the time slot is available
    const isTimeSlotTaken = representative.schedule.appointments.some(
      (apt) =>
        apt.date.toDateString() === new Date(date).toDateString() && apt.time === time
    );

    if (isTimeSlotTaken) {
      return res.sendError("This time slot is already taken", 400);
    }

    representative.schedule.appointments.push({
      citizen: req.user.id,
      date,
      time,
      purpose,
      status: "pending",
    });

    await representative.save();

    // Send notification to representative
    await sendCitizenRequestNotification(
      await User.findById(representative.user),
      req.user,
      "Appointment Request"
    );

    res.sendSuccess(representative.schedule, "Appointment scheduled successfully");
  } catch (err) {
    next(err);
  }
};

// Get representative's performance metrics
exports.getPerformanceMetrics = async (req, res, next) => {
  try {
    const representative = await Representative.findById(req.params.representativeId);

    if (!representative) {
      return res.sendError("Representative not found", 404);
    }

    const totalInteractions = await Interaction.countDocuments({
      representative: representative._id,
    });

    const resolvedInteractions = await Interaction.countDocuments({
      representative: representative._id,
      status: "resolved",
    });

    const averageResponseTime = await Interaction.aggregate([
      { $match: { representative: representative._id } },
      {
        $project: {
          responseTime: {
            $subtract: [
              { $arrayElemAt: ["$messages.createdAt", 1] },
              "$createdAt",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$responseTime" },
        },
      },
    ]);

    const metrics = {
      totalInteractions,
      resolvedInteractions,
      resolutionRate:
        totalInteractions > 0
          ? (resolvedInteractions / totalInteractions) * 100
          : 0,
      averageResponseTime: averageResponseTime[0]?.avgTime || 0,
      rating: representative.rating,
      totalReviews: representative.reviews.length,
    };

    res.sendSuccess(metrics);
  } catch (err) {
    next(err);
  }
};
