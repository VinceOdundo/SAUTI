const User = require("../models/User");
const { ROLES } = require("../middlewares/rbacMiddleware");

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: ROLES.ADMIN });

    if (!adminExists) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      await User.create({
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        role: ROLES.ADMIN,
        isVerified: true,
      });

      console.log("Default admin user created successfully");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

module.exports = createDefaultAdmin;
