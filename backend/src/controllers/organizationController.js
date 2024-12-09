const Organization = require("../models/Organization");
const User = require("../models/User");
const { uploadToS3, deleteFromS3 } = require("../utils/s3Utils");
const { sendVerificationEmail } = require("../services/emailService");

exports.registerOrganization = async (req, res) => {
  try {
    const {
      name,
      type,
      registrationNumber,
      contact,
      areas,
      focus,
      description,
      website,
      socialMedia,
    } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ registrationNumber });
    if (existingOrg) {
      return res.status(400).json({
        message: "Organization with this registration number already exists",
      });
    }

    // Handle certificate upload
    if (!req.file) {
      return res.status(400).json({
        message: "Registration certificate is required",
      });
    }

    // Upload certificate to S3
    const certificateUrl = await uploadToS3(
      req.file,
      `organizations/${registrationNumber}/certificate`
    );

    // Create organization
    const organization = await Organization.create({
      name,
      type,
      registrationNumber,
      verificationDocuments: {
        certificate: {
          url: certificateUrl,
        },
      },
      contact,
      representatives: [
        {
          user: req.user._id,
          role: "admin",
        },
      ],
      areas,
      focus,
      description,
      website,
      socialMedia,
    });

    // Update user's role and organization
    await User.findByIdAndUpdate(req.user._id, {
      role: type.toLowerCase(),
      organizationId: organization._id,
    });

    // Send verification email to admin
    await sendVerificationEmail(
      process.env.ADMIN_EMAIL,
      "New Organization Registration",
      {
        organizationName: name,
        registrationNumber,
        type,
      }
    );

    res.status(201).json({
      message: "Organization registered successfully",
      organization,
    });
  } catch (error) {
    console.error("Organization registration error:", error);
    res.status(500).json({
      message: "Error registering organization",
      error: error.message,
    });
  }
};

exports.verifyOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { verified, notes } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    organization.verified = verified;
    if (notes) {
      organization.verificationNotes = notes;
    }

    await organization.save();

    // Update all organization representatives' verification status
    await User.updateMany(
      { organizationId: organization._id },
      { isVerified: verified }
    );

    res.json({
      message: `Organization ${
        verified ? "verified" : "rejected"
      } successfully`,
      organization,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying organization",
      error: error.message,
    });
  }
};

exports.getOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const organization = await Organization.findById(organizationId).populate(
      "representatives.user",
      "name email avatar"
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ organization });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organization",
      error: error.message,
    });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.verified;
    delete updates.verificationDocuments;
    delete updates.representatives;

    const organization = await Organization.findOneAndUpdate(
      { _id: organizationId, "representatives.user": req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({
        message:
          "Organization not found or you don't have permission to update",
      });
    }

    // Handle certificate update if provided
    if (req.file) {
      // Delete old certificate if it exists
      if (organization.verificationDocuments?.certificate?.url) {
        await deleteFromS3(organization.verificationDocuments.certificate.url);
      }

      // Upload new certificate
      const certificateUrl = await uploadToS3(
        req.file,
        `organizations/${organization.registrationNumber}/certificate`
      );

      organization.verificationDocuments.certificate = {
        url: certificateUrl,
        verified: false,
      };
      organization.verified = false;
      await organization.save();
    }

    res.json({
      message: "Organization updated successfully",
      organization,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating organization",
      error: error.message,
    });
  }
};

exports.addRepresentative = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { userId, role, title } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check if user is already a representative
    const isExisting = organization.representatives.some(
      (rep) => rep.user.toString() === userId
    );
    if (isExisting) {
      return res.status(400).json({
        message: "User is already a representative of this organization",
      });
    }

    organization.representatives.push({
      user: userId,
      role: role || "member",
      title,
    });

    await organization.save();

    // Update user's role and organization
    await User.findByIdAndUpdate(userId, {
      role: organization.type.toLowerCase(),
      organizationId: organization._id,
    });

    res.json({
      message: "Representative added successfully",
      organization,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding representative",
      error: error.message,
    });
  }
};
