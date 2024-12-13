const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");
const { rbac, ROLES } = require("../middleware/rbacMiddleware");
const {
  createFeedback,
  getFeedback,
  respondToFeedback,
} = require("../controllers/feedbackController");

router.use(authenticateUser);

router.post("/", createFeedback);
router.get("/", getFeedback);
router.post("/:id/respond", rbac([ROLES.REPRESENTATIVE]), respondToFeedback);

module.exports = router;
