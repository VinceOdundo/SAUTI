const NotificationPreference = require("../models/NotificationPreference");

// Get user notification preferences
exports.getPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({
      user: req.user._id,
    });

    if (!preferences) {
      preferences = await NotificationPreference.createDefault(req.user._id);
    }

    res.json({
      success: true,
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching notification preferences",
      error: error.message,
    });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences, emailDigest, doNotDisturb } = req.body;

    let userPreferences = await NotificationPreference.findOne({
      user: req.user._id,
    });

    if (!userPreferences) {
      userPreferences = await NotificationPreference.createDefault(
        req.user._id
      );
    }

    // Update preferences if provided
    if (preferences) {
      Object.keys(preferences).forEach((type) => {
        if (userPreferences.preferences[type]) {
          userPreferences.preferences[type] = {
            ...userPreferences.preferences[type],
            ...preferences[type],
          };
        }
      });
    }

    // Update email digest settings if provided
    if (emailDigest) {
      userPreferences.emailDigest = {
        ...userPreferences.emailDigest,
        ...emailDigest,
      };
    }

    // Update do not disturb settings if provided
    if (doNotDisturb) {
      userPreferences.doNotDisturb = {
        ...userPreferences.doNotDisturb,
        ...doNotDisturb,
      };
    }

    await userPreferences.save();

    res.json({
      success: true,
      preferences: userPreferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating notification preferences",
      error: error.message,
    });
  }
};

// Reset notification preferences to default
exports.resetPreferences = async (req, res) => {
  try {
    await NotificationPreference.findOneAndDelete({ user: req.user._id });
    const preferences = await NotificationPreference.createDefault(
      req.user._id
    );

    res.json({
      success: true,
      message: "Preferences reset to default",
      preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting notification preferences",
      error: error.message,
    });
  }
};
