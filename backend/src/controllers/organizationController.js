const Organization = require("../models/Organization");
const User = require("../models/User");
const Project = require("../models/Project");
const Interaction = require("../models/Interaction");
const path = require("path");

const registerOrganization = async (req, res) => {
  try {
    const { name, type, registrationNumber, description, contact, focus, address, mission, vision } = req.body;

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
      address,
      mission,
      vision,
      representatives: [{ user: req.user._id, role: "admin" }],
      verificationDocuments: {
        certificate: {
          url: certificateUrl,
          verified: false,
        },
      },
      settings: {
        notifications: true,
        privacy: {
          projectVisibility: 'public',
          contactVisibility: 'registered'
        }
      }
    });

    await organization.save();

    // Update user's role and organization
    await User.findByIdAndUpdate(req.user._id, {
      role: 'organization',
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
      message: `Organization ${verified ? "verified" : "rejected"} successfully`,
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
    const organization = await Organization.findById(organizationId)
      .populate('representatives.user', 'name email profile')
      .populate({
        path: 'projects',
        select: 'title description status startDate endDate impact',
        match: { status: { $ne: 'deleted' } }
      });

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
    const allowedUpdates = [
      'name',
      'description',
      'contact',
      'focus',
      'address',
      'mission',
      'vision'
    ];

    // Filter out non-allowed updates
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Handle certificate update if provided
    if (req.file) {
      filteredUpdates['verificationDocuments.certificate.url'] = `/uploads/${req.file.filename}`;
      filteredUpdates['verificationDocuments.certificate.verified'] = false;
    }

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      filteredUpdates,
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
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

const addRepresentative = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { email, role } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a representative
    if (organization.representatives.some(rep => rep.user.toString() === user._id.toString())) {
      return res.status(400).json({ message: "User is already a representative" });
    }

    organization.representatives.push({ user: user._id, role });
    await organization.save();

    // Update user's role and organization
    user.role = 'organization';
    user.organizationId = organization._id;
    await user.save();

    res.json({
      message: "Representative added successfully",
      representative: { user, role }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding representative",
      error: error.message
    });
  }
};

const removeRepresentative = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { userId } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Remove representative
    organization.representatives = organization.representatives.filter(
      rep => rep.user.toString() !== userId
    );
    await organization.save();

    // Update user's role and organization
    await User.findByIdAndUpdate(userId, {
      $unset: { organizationId: "" },
      role: 'user'
    });

    res.json({ message: "Representative removed successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error removing representative",
      error: error.message
    });
  }
};

const getOrganizationProjects = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { organization: organizationId };
    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('team', 'name email profile');

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching projects",
      error: error.message
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const projectData = req.body;

    const project = new Project({
      ...projectData,
      organization: organizationId
    });

    await project.save();

    res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating project",
      error: error.message
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { organizationId, projectId } = req.params;
    const updates = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, organization: organizationId },
      updates,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project updated successfully",
      project
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating project",
      error: error.message
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { organizationId, projectId } = req.params;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, organization: organizationId },
      { status: 'deleted' },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting project",
      error: error.message
    });
  }
};

const getOrganizationStats = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { organization: organizationId };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [projects, interactions] = await Promise.all([
      Project.aggregate([
        { $match: { ...query, status: { $ne: 'deleted' } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Interaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      projects: projects.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      interactions: interactions.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching organization stats",
      error: error.message
    });
  }
};

const getOrganizationInteractions = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { type, status, page = 1, limit = 10 } = req.query;

    const query = { organization: organizationId };
    if (type) query.type = type;
    if (status) query.status = status;

    const interactions = await Interaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('citizen', 'name email profile')
      .populate('representative', 'name email profile');

    const total = await Interaction.countDocuments(query);

    res.json({
      interactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching interactions",
      error: error.message
    });
  }
};

const updateOrganizationSettings = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { notifications, privacy } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (notifications !== undefined) {
      organization.settings.notifications = notifications;
    }

    if (privacy) {
      organization.settings.privacy = {
        ...organization.settings.privacy,
        ...privacy
      };
    }

    await organization.save();

    res.json({
      message: "Settings updated successfully",
      settings: organization.settings
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating settings",
      error: error.message
    });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    const organization = await Organization.findById(organizationId)
      .select('verified verificationDocuments verificationNotes');
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({
      verified: organization.verified,
      documents: organization.verificationDocuments,
      notes: organization.verificationNotes
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching verification status",
      error: error.message
    });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Update all representatives
    await User.updateMany(
      { organizationId },
      { $unset: { organizationId: "" }, role: 'user' }
    );

    // Soft delete projects
    await Project.updateMany(
      { organization: organizationId },
      { status: 'deleted' }
    );

    // Delete the organization
    await Organization.findByIdAndDelete(organizationId);

    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting organization",
      error: error.message
    });
  }
};

module.exports = {
  registerOrganization,
  verifyOrganization,
  getOrganization,
  updateOrganization,
  addRepresentative,
  removeRepresentative,
  getOrganizationProjects,
  createProject,
  updateProject,
  deleteProject,
  getOrganizationStats,
  getOrganizationInteractions,
  updateOrganizationSettings,
  getVerificationStatus,
  deleteOrganization
};
