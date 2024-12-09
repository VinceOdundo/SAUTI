const Representative = require("../models/Representative");
const User = require("../models/User");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Utils");
const { sendVerificationEmail } = require("../services/emailService");

exports.registerRepresentative = async (req, res) => {
  try {
    const {
      position,
      party,
      county,
      constituency,
      ward,
      bio,
      officeContact,
      socialMedia,
      term,
    } = req.body;

    // Check if user is already a representative
    const existingRep = await Representative.findOne({ user: req.user._id });
    if (existingRep) {
      return res.status(400).json({
        message: "You are already registered as a representative",
      });
    }

    // Handle document uploads
    if (!req.files?.idCard || !req.files?.certificate) {
      return res.status(400).json({
        message: "Both ID card and certificate are required",
      });
    }

    // Upload documents to S3
    const idCardUrl = await uploadToS3(
      req.files.idCard[0],
      `representatives/${req.user._id}/id-card`
    );

    const certificateUrl = await uploadToS3(
      req.files.certificate[0],
      `representatives/${req.user._id}/certificate`
    );

    // Upload additional documents if provided
    const additionalDocs = [];
    if (req.files.additionalDocs) {
      for (const doc of req.files.additionalDocs) {
        const url = await uploadToS3(
          doc,
          `representatives/${req.user._id}/additional/${doc.originalname}`
        );
        additionalDocs.push({
          name: doc.originalname,
          url,
        });
      }
    }

    // Create representative
    const representative = await Representative.create({
      user: req.user._id,
      position,
      party,
      county,
      constituency,
      ward,
      bio,
      officeContact,
      socialMedia,
      term,
      verificationDocuments: {
        idCard: {
          url: idCardUrl,
        },
        certificate: {
          url: certificateUrl,
        },
        additionalDocs,
      },
    });

    // Update user's role
    await User.findByIdAndUpdate(req.user._id, {
      role: "representative",
    });

    // Send verification email to admin
    await sendVerificationEmail(
      process.env.ADMIN_EMAIL,
      "New Representative Registration",
      {
        representativeName: req.user.name,
        position,
        county,
      }
    );

    res.status(201).json({
      message: "Representative registration submitted successfully",
      representative,
    });
  } catch (error) {
    console.error("Representative registration error:", error);
    res.status(500).json({
      message: "Error registering representative",
      error: error.message,
    });
  }
};

exports.verifyRepresentative = async (req, res) => {
  try {
    const { representativeId } = req.params;
    const { status, notes } = req.body;

    const representative = await Representative.findById(representativeId);
    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    representative.verificationStatus = status;
    if (notes) {
      representative.verificationNotes = notes;
    }

    // Update document verification status if provided
    if (req.body.documents) {
      if (req.body.documents.idCard !== undefined) {
        representative.verificationDocuments.idCard.verified =
          req.body.documents.idCard;
      }
      if (req.body.documents.certificate !== undefined) {
        representative.verificationDocuments.certificate.verified =
          req.body.documents.certificate;
      }
      if (req.body.documents.additionalDocs) {
        representative.verificationDocuments.additionalDocs.forEach(
          (doc, i) => {
            if (req.body.documents.additionalDocs[i] !== undefined) {
              doc.verified = req.body.documents.additionalDocs[i];
            }
          }
        );
      }
    }

    // Set overall verification status based on document verification
    representative.verified =
      status === "verified" &&
      representative.verificationDocuments.idCard.verified &&
      representative.verificationDocuments.certificate.verified;

    await representative.save();

    // Update user's verification status
    await User.findByIdAndUpdate(representative.user, {
      isVerified: representative.verified,
    });

    res.json({
      message: `Representative ${status} successfully`,
      representative,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying representative",
      error: error.message,
    });
  }
};

exports.getRepresentative = async (req, res) => {
  try {
    const { representativeId } = req.params;
    const representative = await Representative.findById(representativeId)
      .populate("user", "name email avatar")
      .populate("followers", "name avatar")
      .populate("following", "name avatar");

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    res.json({ representative });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching representative",
      error: error.message,
    });
  }
};

exports.updateRepresentative = async (req, res) => {
  try {
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.verified;
    delete updates.verificationStatus;
    delete updates.verificationDocuments;
    delete updates.user;

    const representative = await Representative.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    // Handle document updates if provided
    if (req.files) {
      const updatedDocs = {};

      if (req.files.idCard) {
        // Delete old ID card if it exists
        if (representative.verificationDocuments?.idCard?.url) {
          await deleteFromS3(representative.verificationDocuments.idCard.url);
        }

        // Upload new ID card
        const idCardUrl = await uploadToS3(
          req.files.idCard[0],
          `representatives/${req.user._id}/id-card`
        );

        representative.verificationDocuments.idCard = {
          url: idCardUrl,
          verified: false,
        };
        updatedDocs.idCard = true;
      }

      if (req.files.certificate) {
        // Delete old certificate if it exists
        if (representative.verificationDocuments?.certificate?.url) {
          await deleteFromS3(
            representative.verificationDocuments.certificate.url
          );
        }

        // Upload new certificate
        const certificateUrl = await uploadToS3(
          req.files.certificate[0],
          `representatives/${req.user._id}/certificate`
        );

        representative.verificationDocuments.certificate = {
          url: certificateUrl,
          verified: false,
        };
        updatedDocs.certificate = true;
      }

      if (req.files.additionalDocs) {
        // Delete old additional docs
        for (const doc of representative.verificationDocuments.additionalDocs) {
          await deleteFromS3(doc.url);
        }

        // Upload new additional docs
        const additionalDocs = [];
        for (const doc of req.files.additionalDocs) {
          const url = await uploadToS3(
            doc,
            `representatives/${req.user._id}/additional/${doc.originalname}`
          );
          additionalDocs.push({
            name: doc.originalname,
            url,
            verified: false,
          });
        }

        representative.verificationDocuments.additionalDocs = additionalDocs;
        updatedDocs.additionalDocs = true;
      }

      // If any documents were updated, set verification status to pending
      if (Object.keys(updatedDocs).length > 0) {
        representative.verificationStatus = "pending";
        representative.verified = false;
        await User.findByIdAndUpdate(req.user._id, { isVerified: false });
      }

      await representative.save();
    }

    res.json({
      message: "Representative updated successfully",
      representative,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating representative",
      error: error.message,
    });
  }
};

exports.followRepresentative = async (req, res) => {
  try {
    const { representativeId } = req.params;
    const representative = await Representative.findById(representativeId);

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    // Check if user is already following
    if (representative.followers.includes(req.user._id)) {
      return res.status(400).json({
        message: "You are already following this representative",
      });
    }

    representative.followers.push(req.user._id);
    await representative.save();

    res.json({
      message: "Successfully followed representative",
      representative,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error following representative",
      error: error.message,
    });
  }
};

exports.unfollowRepresentative = async (req, res) => {
  try {
    const { representativeId } = req.params;
    const representative = await Representative.findById(representativeId);

    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    // Remove user from followers
    representative.followers = representative.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await representative.save();

    res.json({
      message: "Successfully unfollowed representative",
      representative,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error unfollowing representative",
      error: error.message,
    });
  }
};

exports.getRepresentativeStats = async (req, res) => {
  try {
    const representative = await Representative.findOne({ user: req.user._id });
    if (!representative) {
      return res.status(404).json({ message: "Representative not found" });
    }

    await representative.updateStats();

    res.json({
      stats: representative.stats,
      followerCount: representative.followerCount,
      followingCount: representative.followingCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching representative stats",
      error: error.message,
    });
  }
};
