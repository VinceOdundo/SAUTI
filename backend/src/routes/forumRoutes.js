const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { checkVerificationStatus } = require("../controllers/userController");

// Apply auth middleware to all routes
router.use(protect);

// Public routes (still require auth but not verification)
router.get("/posts", forumController.getPosts);
router.get("/posts/:postId", forumController.getPost);

// Protected routes (require verification)
router.use(checkVerificationStatus);

// Post management
router.post("/posts", forumController.createPost);
router.put("/posts/:postId", forumController.updatePost);
router.delete("/posts/:postId", forumController.deletePost);

// Interactions
router.post("/posts/:postId/vote", forumController.votePost);
router.post("/posts/:postId/comments", forumController.addComment);
router.post(
  "/posts/:postId/comments/:commentId/vote",
  forumController.voteComment
);
router.post("/posts/:postId/reshare", forumController.resharePost);

// Moderation
router.post("/posts/:postId/report", forumController.reportPost);

// Admin only routes
router.use(authorize("admin"));
router.post("/posts/:postId/moderate", forumController.moderatePost);

module.exports = router;
