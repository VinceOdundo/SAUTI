const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authMiddleware");
const { rbac, ROLES } = require("../middlewares/rbacMiddleware");
const {
  upload,
  handleUploadError,
} = require("../middlewares/uploadMiddleware");
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  votePost,
  addComment,
  voteComment,
  reportPost,
  moderatePost,
  votePoll,
} = require("../controllers/forumController");

// Configure multer for multiple file uploads
const uploadFields = upload.fields([
  { name: "images", maxCount: 4 },
  { name: "videos", maxCount: 1 },
  { name: "documents", maxCount: 2 },
]);

// Public routes
router.get("/posts", getPosts);
router.get("/posts/:postId", getPost);

// Protected routes
router.use(authenticateUser);

// Post creation and management
router.post("/posts", uploadFields, handleUploadError, createPost);

router.patch("/posts/:postId", uploadFields, handleUploadError, updatePost);

router.delete("/posts/:postId", deletePost);

// Voting
router.post("/posts/:postId/vote", votePost);
router.post("/posts/:postId/comments/:commentId/vote", voteComment);

// Comments
router.post("/posts/:postId/comments", addComment);

// Polls
router.post("/posts/:postId/poll/vote", votePoll);

// Reporting
router.post("/posts/:postId/report", reportPost);

// Moderation (admin only)
router.post("/posts/:postId/moderate", rbac([ROLES.ADMIN]), moderatePost);

module.exports = router;
