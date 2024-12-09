const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const {
  createPost,
  getPosts,
  votePost,
} = require("../controllers/forumController");

// Public routes
router.get("/posts", getPosts);

// Protected routes
router.use(authenticateUser);
router.post("/posts", createPost);
router.post("/posts/:id/vote", votePost);

module.exports = router;
