const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
const {
  createMessage,
  getMessages,
  updateMessage,
} = require("../controllers/communicationController");

router.use(authenticateUser);
router.use(rbac([ROLES.REPRESENTATIVE]));

router.post("/messages", createMessage);
router.get("/messages", getMessages);
router.patch("/messages/:id", updateMessage);

module.exports = router;
