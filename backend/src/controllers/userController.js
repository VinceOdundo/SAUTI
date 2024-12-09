exports.updateUserProfile = async (req, res) => {
  try {
    const { county, constituency, ward, yob, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        county,
        constituency,
        ward,
        yob,
        phone,
        isProfileComplete: true,
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user profile", error: error.message });
  }
};
