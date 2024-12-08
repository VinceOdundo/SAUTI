const express = require("express");
const router = express.Router();
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");

// Admin only routes
router.use(authenticateUser);
router.get("/", rbac([ROLES.ADMIN]), getAllUsers);
router.patch("/:id/role", rbac([ROLES.ADMIN]), updateUserRole);
router.delete("/:id", rbac([ROLES.ADMIN]), deleteUser);

module.exports = router;
