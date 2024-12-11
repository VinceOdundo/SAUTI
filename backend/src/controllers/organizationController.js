const Organization = require("../models/Organization");
const User = require("../models/User");
const path = require("path");

const registerOrganization = async (req, res) => {
  try {
    const { name, type, registrationNumber, description, contact, focus } =
      req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ registrationNumber });
    if (existingOrg) {
      return res.status(400).json({
        message: "Organization with this registration number already exists",
      });
    }

    // Handle certificate upload
    let certificateUrl;
    if (req.file) {
      certificateUrl = `/uploads/${req.file.filename}`;
    }

    // Create organization
    const organization = new Organization({
      name,
      type,
      registrationNumber,
      description,
      contact,
      focus,
      representatives: [{ user: req.user._id, role: "admin" }],
      verificationDocuments: {
        certificate: {
          url: certificateUrl,
          verified: false,
        },
      },
    });

    await organization.save();

    // Update user's role and organization
    await User.findByIdAndUpdate(req.user._id, {
      role: type.toLowerCase(),
      organizationId: organization._id,
    });

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

const verifyOrganization = async (req, res) => {
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

const getOrganization = async (req, res) => {
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

const updateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.verified;
    delete updates.verificationDocuments;
    delete updates.representatives;

    const organization = await Organization.findOne({
      _id: organizationId,
      "representatives.user": req.user._id,
    });

    if (!organization) {
      return res.status(404).json({
        message:
          "Organization not found or you don't have permission to update",
      });
    }

    // Handle certificate update
    if (req.file) {
      organization.verificationDocuments.certificate = {
        url: `/uploads/${req.file.filename}`,
        verified: false,
      };
    }

    // Update other fields
    Object.assign(organization, updates);
    await organization.save();

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

const addRepresentative = async (req, res) => {
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

module.exports = {
  registerOrganization,
  verifyOrganization,
  getOrganization,
  updateOrganization,
  addRepresentative,
};
