const { validationResult } = require("express-validator");
const VerificationRequest = require("../models/VerificationRequest");
const {
  uploadToLocal,
  deleteFromLocal,
} = require("../services/storageService");
const { sendVerificationStatusEmail } = require("../services/emailService");
const { validateDocument } = require("../utils/documentUtils");

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

exports.submitVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        errors: errors.array(),
      });
    }

    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "No document uploaded",
      });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        status: "error",
        message: "File size exceeds 5MB limit",
      });
    }

    // Validate document type and content
    const validationResult = validateDocument(file);
    if (!validationResult.isValid) {
      return res.status(400).json({
        status: "error",
        message: validationResult.message,
      });
    }

    // Check for existing pending request
    const existingRequest = await VerificationRequest.findOne({
      user: req.user._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        status: "error",
        message: "You already have a pending verification request",
      });
    }

    // Upload document to local storage
    const uploadResult = await uploadToLocal(file);

    const verificationRequest = await VerificationRequest.create({
      user: req.user._id,
      documentType,
      document: {
        url: uploadResult.Location,
        key: uploadResult.Key,
        type: file.mimetype,
        path: uploadResult.path,
      },
      status: "pending",
    });

    // Update user's verification status
    await req.user.updateOne({
      $set: {
        verificationStatus: "pending",
        lastVerificationRequest: verificationRequest._id,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Verification request submitted successfully",
      request: {
        id: verificationRequest._id,
        status: verificationRequest.status,
        documentType: verificationRequest.documentType,
        submittedAt: verificationRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("Verification submission error:", error);
    res.status(500).json({
      status: "error",
      message: "Error submitting verification request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getPendingVerifications = async (req, res) => {
  try {
    // Validate user has admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      });
    }

    const { status = "pending", page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const verifications = await VerificationRequest.find({ status })
      .populate("user", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await VerificationRequest.countDocuments({ status });

    res.json({
      status: "success",
      data: verifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get verifications error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching verification requests",
    });
  }
};

exports.reviewVerification = async (req, res) => {
  try {
    // Validate user has admin access
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status",
      });
    }

    const verification = await VerificationRequest.findById(id).populate(
      "user",
      "email"
    );

    if (!verification) {
      return res.status(404).json({
        status: "error",
        message: "Verification request not found",
      });
    }

    // Prevent reviewing already processed requests
    if (verification.status !== "pending") {
      return res.status(400).json({
        status: "error",
        message: "This request has already been processed",
      });
    }

    // If rejected, delete the document from local storage
    if (status === "rejected") {
      try {
        await deleteFromLocal(verification.document.key);
      } catch (error) {
        console.error("Error deleting rejected document:", error);
        // Continue with the review process even if deletion fails
      }
    }

    verification.status = status;
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = Date.now();
    verification.reviewNotes = notes;

    await verification.save();

    // Update user's verification status
    await verification.user.updateOne({
      $set: {
        verificationStatus: status,
        verifiedAt: status === "approved" ? Date.now() : undefined,
      },
    });

    // Send email notification
    await sendVerificationStatusEmail(verification.user.email, status, notes);

    res.json({
      status: "success",
      message: `Verification request ${status}`,
      verification: {
        id: verification._id,
        status: verification.status,
        reviewedAt: verification.reviewedAt,
        notes: verification.reviewNotes,
      },
    });
  } catch (error) {
    console.error("Review verification error:", error);
    res.status(500).json({
      status: "error",
      message: "Error reviewing verification request",
    });
  }
};

exports.getVerificationStatus = async (req, res) => {
  try {
    const verification = await VerificationRequest.findOne({
      user: req.user._id,
    })
      .sort("-createdAt")
      .select("-document.path"); // Don't expose internal file path

    if (!verification) {
      return res.status(404).json({
        status: "error",
        message: "No verification request found",
      });
    }

    res.json({
      status: "success",
      data: {
        id: verification._id,
        status: verification.status,
        documentType: verification.documentType,
        submittedAt: verification.createdAt,
        reviewedAt: verification.reviewedAt,
        notes: verification.reviewNotes,
      },
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching verification status",
    });
  }
};

// Serve document files
exports.getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await VerificationRequest.findById(id);

    if (!verification) {
      return res.status(404).json({
        status: "error",
        message: "Document not found",
      });
    }

    // Check if user has permission to access this document
    if (
      verification.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Access denied",
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", verification.document.type);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${verification.document.key}"`
    );

    res.sendFile(verification.document.path);
  } catch (error) {
    console.error("Get document error:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching document",
    });
  }
};
