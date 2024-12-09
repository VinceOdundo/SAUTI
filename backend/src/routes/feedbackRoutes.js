const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
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
