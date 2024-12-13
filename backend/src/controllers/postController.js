const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images and videos are allowed"));
  },
}).single("media");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { content, category, tags, location } = req.body;
      const postData = {
        author: req.user._id,
        content,
        category,
        tags: tags ? JSON.parse(tags) : [],
        location: location ? JSON.parse(location) : null,
      };

      if (req.file) {
        postData.media = {
          url: `/uploads/posts/${req.file.filename}`,
          type: req.file.mimetype.startsWith("image") ? "image" : "video",
        };
      }

      const post = await Post.create(postData);
      await post.populate("author", "name profile.avatar");

      res.status(201).json({
        success: true,
        post,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all posts with pagination and filters
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.tags) query.tags = { $in: req.query.tags.split(",") };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name profile.avatar")
      .populate({
        path: "comments",
        select: "content author createdAt",
        populate: {
          path: "author",
          select: "name profile.avatar",
        },
      });

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profile.avatar")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name profile.avatar",
        },
      })
      .populate("reshares.user", "name profile.avatar");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own posts",
      });
    }

    const { content, category, tags } = req.body;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;

    await post.save();
    await post.populate("author", "name profile.avatar");

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    await Comment.deleteMany({ _id: { $in: post.comments } });
    await post.remove();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Vote on a post
exports.votePost = async (req, res) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id;
    const hasUpvoted = post.votes.upvotes.includes(userId);
    const hasDownvoted = post.votes.downvotes.includes(userId);

    if (type === "upvote") {
      if (hasUpvoted) {
        post.votes.upvotes.pull(userId);
      } else {
        post.votes.upvotes.push(userId);
        if (hasDownvoted) {
          post.votes.downvotes.pull(userId);
        }
      }
    } else if (type === "downvote") {
      if (hasDownvoted) {
        post.votes.downvotes.pull(userId);
      } else {
        post.votes.downvotes.push(userId);
        if (hasUpvoted) {
          post.votes.upvotes.pull(userId);
        }
      }
    }

    await post.save();
    await post.populate("author", "name profile.avatar");

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Reshare a post
exports.resharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id;
    const hasReshared = post.reshares.some(
      (reshare) => reshare.user.toString() === userId.toString()
    );

    if (hasReshared) {
      post.reshares = post.reshares.filter(
        (reshare) => reshare.user.toString() !== userId.toString()
      );
    } else {
      post.reshares.push({ user: userId });
    }

    await post.save();
    await post.populate("author", "name profile.avatar");
    await post.populate("reshares.user", "name profile.avatar");

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      content: req.body.content,
      author: req.user._id,
      post: post._id,
    });

    post.comments.push(comment._id);
    await post.save();

    await comment.populate("author", "name profile.avatar");

    res.status(201).json({
      success: true,
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    const post = await Post.findById(comment.post);
    post.comments.pull(commentId);
    await post.save();
    await comment.remove();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
