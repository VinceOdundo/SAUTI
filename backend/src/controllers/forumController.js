const Post = require("../models/Post");
const Comment = require("../models/Comment");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { validatePost } = require("../validators/postValidator");
const { handleError } = require("../utils/errorHandler");
const { uploadToStorage } = require("../utils/fileUpload");

// Configure multer for media uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 4, // Max 4 files per post
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and MP4 are allowed."
        )
      );
    }
  },
}).array("media", 4);

// Create a new post
exports.createPost = async (req, res, next) => {
  try {
    // Validate post data
    const validationError = validatePost(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Handle media uploads if any
    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        const url = await uploadToStorage(file.buffer, fileName, file.mimetype);
        mediaUrls.push({ url, type: file.mimetype });
      }
    }

    const post = new Post({
      ...req.body,
      author: req.user.id,
      media: mediaUrls,
      analytics: {
        views: 0,
        uniqueViewers: [],
        engagement: {
          shares: 0,
          comments: 0,
          reactions: {},
        },
      },
    });

    await post.save();
    await post.populate([
      { path: "author", select: "name avatar" },
      { path: "category", select: "name" },
    ]);

    // Track user activity
    await updateUserActivity(req.user.id, "post_created");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    handleError(err, res);
  }
};

// Get posts with filters and pagination
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on filters
    const query = { status: "published" };
    if (req.query.category) query.category = req.query.category;
    if (req.query.author) query.author = req.query.author;
    if (req.query.tag) query.tags = req.query.tag;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { content: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Add date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(req.query.sort || { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name avatar")
        .populate("category", "name")
        .populate({
          path: "comments",
          options: { limit: 2, sort: { createdAt: -1 } },
          populate: { path: "author", select: "name avatar" },
        }),
      Post.countDocuments(query),
    ]);

    // Enhance posts with engagement metrics
    const enhancedPosts = posts.map((post) => ({
      ...post.toObject(),
      engagement: {
        upvoteCount: post.votes.upvotes.length,
        downvoteCount: post.votes.downvotes.length,
        commentCount: post.comments.length,
        shareCount: post.reshares.length,
      },
      userInteraction: {
        hasVoted: post.getUserVote(req.user._id),
        hasCommented: post.hasUserCommented(req.user._id),
        hasShared: post.hasUserReshared(req.user._id),
      },
    }));

    res.json({
      success: true,
      posts: enhancedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    handleError(err, res);
  }
};

// Get a single post by ID
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "name avatar bio")
      .populate("category", "name")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name avatar" },
      })
      .populate("votes.upvotes", "name avatar")
      .populate("votes.downvotes", "name avatar");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Track view and analytics
    const isNewView = !post.analytics.uniqueViewers.includes(req.user._id);
    if (isNewView) {
      post.analytics.views += 1;
      post.analytics.uniqueViewers.push(req.user._id);

      // Update engagement metrics
      const currentHour = new Date().getHours();
      post.analytics.viewsByHour =
        post.analytics.viewsByHour || new Array(24).fill(0);
      post.analytics.viewsByHour[currentHour]++;

      await post.save();
    }

    // Enhance post with user-specific data
    const enhancedPost = {
      ...post.toObject(),
      userInteraction: {
        hasVoted: post.getUserVote(req.user._id),
        hasCommented: post.hasUserCommented(req.user._id),
        hasShared: post.hasUserReshared(req.user._id),
      },
    };

    res.json({
      success: true,
      post: enhancedPost,
    });
  } catch (err) {
    handleError(err, res);
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      author: req.user._id,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or you don't have permission to update it",
      });
    }

    // Validate update data
    const validationError = validatePost(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const updates = req.body;
    const protectedFields = [
      "author",
      "votes",
      "comments",
      "analytics",
      "reports",
      "moderationLog",
      "editHistory",
      "reshares",
      "originalPost",
    ];

    // Remove protected fields
    protectedFields.forEach((field) => delete updates[field]);

    // Handle media updates
    if (req.files && req.files.length > 0) {
      const mediaUrls = [];
      for (const file of req.files) {
        const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
        const url = await uploadToStorage(file.buffer, fileName, file.mimetype);
        mediaUrls.push({ url, type: file.mimetype });
      }
      updates.media = mediaUrls;
    }

    // Add edit history
    post.editHistory.push({
      editedAt: new Date(),
      editor: req.user._id,
      changes: Object.keys(updates),
    });

    Object.assign(post, updates);
    await post.save();

    await post.populate([
      { path: "author", select: "name avatar" },
      { path: "category", select: "name" },
    ]);

    res.json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (err) {
    handleError(err, res);
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      author: req.user._id,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or you don't have permission to delete it",
      });
    }

    // Handle reshare cleanup
    if (post.originalPost) {
      const originalPost = await Post.findById(post.originalPost);
      if (originalPost) {
        originalPost.reshares = originalPost.reshares.filter(
          (reshare) => !reshare.user.equals(req.user._id)
        );
        await originalPost.save();
      }
    }

    // Soft delete
    post.status = "deleted";
    post.deletedAt = new Date();
    post.deletedBy = req.user._id;
    await post.save();

    // Update user activity
    await updateUserActivity(req.user._id, "post_deleted");

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err) {
    handleError(err, res);
  }
};

// Vote on a post
exports.votePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const voteType = req.body.type === "upvote" ? "upvotes" : "downvotes";
    const oppositeType = voteType === "upvotes" ? "downvotes" : "upvotes";

    // Remove from opposite vote array if exists
    post.votes[oppositeType] = post.votes[oppositeType].filter(
      (id) => id.toString() !== req.user.id.toString()
    );

    // Toggle vote in target array
    const voteIndex = post.votes[voteType].indexOf(req.user.id);
    if (voteIndex === -1) {
      post.votes[voteType].push(req.user.id);
    } else {
      post.votes[voteType].splice(voteIndex, 1);
    }

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    handleError(err, res);
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      author: req.user.id,
      content: req.body.content,
    });

    await comment.save();
    post.comments.push(comment._id);
    post.analytics.engagement.comments += 1;
    await post.save();

    await comment.populate("author", "name avatar");
    res.json({ success: true, comment });
  } catch (err) {
    handleError(err, res);
  }
};

exports.voteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const voteType = req.body.type === "upvote" ? "upvotes" : "downvotes";
    const oppositeType = voteType === "upvotes" ? "downvotes" : "upvotes";

    comment.votes[oppositeType] = comment.votes[oppositeType].filter(
      (id) => id.toString() !== req.user.id.toString()
    );

    const voteIndex = comment.votes[voteType].indexOf(req.user.id);
    if (voteIndex === -1) {
      comment.votes[voteType].push(req.user.id);
    } else {
      comment.votes[voteType].splice(voteIndex, 1);
    }

    await comment.save();
    res.json({ success: true, comment });
  } catch (err) {
    handleError(err, res);
  }
};

exports.resharePost = async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    const reshare = new Post({
      author: req.user.id,
      content: req.body.content,
      originalPost: originalPost._id,
      type: "reshare",
    });

    await reshare.save();
    originalPost.reshares.push({ user: req.user.id, post: reshare._id });
    await originalPost.save();

    res.json({ success: true, post: reshare });
  } catch (err) {
    handleError(err, res);
  }
};

exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.reports.push({
      user: req.user.id,
      reason: req.body.reason,
      details: req.body.details,
    });

    await post.save();
    res.json({ success: true, message: "Post reported successfully" });
  } catch (err) {
    handleError(err, res);
  }
};

exports.moderatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.status = req.body.action;
    post.moderationLog.push({
      moderator: req.user.id,
      action: req.body.action,
      reason: req.body.reason,
    });

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    handleError(err, res);
  }
};
