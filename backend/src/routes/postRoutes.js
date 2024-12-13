const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  votePost,
  resharePost,
  addComment,
  deleteComment,
} = require("../controllers/postController");

// Post routes
router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// Voting routes
router.post("/:id/vote", protect, votePost);

// Reshare routes
router.post("/:id/reshare", protect, resharePost);

// Comment routes
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;
