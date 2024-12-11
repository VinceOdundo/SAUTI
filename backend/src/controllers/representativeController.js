const Representative = require("../models/Representative");
const User = require("../models/User");
const {
  validateRepresentative,
} = require("../validators/representativeValidator");

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
