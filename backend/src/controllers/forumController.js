const Post = require("../models/Post");
const { uploadToS3 } = require("../utils/s3Utils");

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags, location, poll, visibility } =
      req.body;

    // Verify user is allowed to post
    if (!req.user.isVerified) {
      return res.status(403).json({
        message: "Account must be verified to create posts",
      });
    }

    // Handle media uploads
    const media = {
      images: [],
      videos: [],
      documents: [],
    };

    if (req.files) {
      // Handle image uploads
      if (req.files.images) {
        for (const image of req.files.images) {
          const url = await uploadToS3(
            image,
            `posts/${req.user._id}/images/${Date.now()}`
          );
          media.images.push({
            url,
            caption: image.originalname,
          });
        }
      }

      // Handle video uploads
      if (req.files.videos) {
        for (const video of req.files.videos) {
          const url = await uploadToS3(
            video,
            `posts/${req.user._id}/videos/${Date.now()}`
          );
          media.videos.push({
            url,
            caption: video.originalname,
            duration: 0, // TODO: Extract video duration
          });
        }
      }

      // Handle document uploads
      if (req.files.documents) {
        for (const doc of req.files.documents) {
          const url = await uploadToS3(
            doc,
            `posts/${req.user._id}/documents/${Date.now()}`
          );
          media.documents.push({
            url,
            name: doc.originalname,
            type: doc.mimetype,
            size: doc.size,
          });
        }
      }
    }

    const post = new Post({
      author: req.user._id,
      title,
      content,
      category,
      tags: tags ? JSON.parse(tags) : [],
      location,
      media,
      poll: poll ? JSON.parse(poll) : null,
      visibility,
    });

    await post.save();
    await post.populate("author", "name avatar");

    res.status(201).json({ post });
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({
      message: "Error creating post",
      error: error.message,
    });
  }
};

// Get posts with filters and pagination
exports.getPosts = async (req, res) => {
  try {
    const {
      category,
      tags,
      location,
      visibility,
      sort = "recent",
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const query = { status: "published" };

    // Apply filters
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(",") };
    if (location) {
      if (location.county) query["location.county"] = location.county;
      if (location.constituency)
        query["location.constituency"] = location.constituency;
      if (location.ward) query["location.ward"] = location.ward;
    }
    if (visibility) query.visibility = visibility;

    // Apply text search
    if (search) {
      query.$text = { $search: search };
    }

    // Apply sorting
    const sortOptions = {
      recent: { createdAt: -1 },
      popular: { "analytics.views": -1 },
      trending: { voteCount: -1 },
      commented: { commentCount: -1 },
    };

    const posts = await Post.find(query)
      .sort(sortOptions[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar")
      .populate("votes.upvotes", "name avatar")
      .populate("votes.downvotes", "name avatar");

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

// Get a single post by ID
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "name avatar")
      .populate("comments.author", "name avatar")
      .populate("votes.upvotes", "name avatar")
      .populate("votes.downvotes", "name avatar");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Increment view count and add unique viewer
    if (!post.analytics.uniqueViewers.includes(req.user._id)) {
      post.analytics.views += 1;
      post.analytics.uniqueViewers.push(req.user._id);
      await post.save();
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching post",
      error: error.message,
    });
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

    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.author;
    delete updates.votes;
    delete updates.comments;
    delete updates.analytics;
    delete updates.reports;
    delete updates.moderationLog;

    // Handle media updates if files are provided
    if (req.files) {
      // TODO: Implement media update logic
    }

    Object.assign(post, updates);
    await post.save();

    res.json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error updating post",
      error: error.message,
    });
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

    post.status = "deleted";
    await post.save();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting post",
      error: error.message,
    });
  }
};

// Vote on a post
exports.votePost = async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const currentVote = post.getUserVote(req.user._id);

    // Remove existing vote if any
    if (currentVote === "up") {
      post.votes.upvotes = post.votes.upvotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else if (currentVote === "down") {
      post.votes.downvotes = post.votes.downvotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    }

    // Add new vote if different from current
    if (vote !== currentVote) {
      if (vote === "up") {
        post.votes.upvotes.push(req.user._id);
      } else if (vote === "down") {
        post.votes.downvotes.push(req.user._id);
      }
    }

    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error voting on post",
      error: error.message,
    });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      author: req.user._id,
      content,
    });

    await post.save();
    await post.populate("comments.author", "name avatar");

    res.json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error adding comment",
      error: error.message,
    });
  }
};

// Vote on a comment
exports.voteComment = async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Remove existing vote if any
    comment.votes.upvotes = comment.votes.upvotes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    comment.votes.downvotes = comment.votes.downvotes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    // Add new vote
    if (vote === "up") {
      comment.votes.upvotes.push(req.user._id);
    } else if (vote === "down") {
      comment.votes.downvotes.push(req.user._id);
    }

    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error voting on comment",
      error: error.message,
    });
  }
};

// Report a post
exports.reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.hasUserReported(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already reported this post" });
    }

    post.reports.push({
      user: req.user._id,
      reason,
    });

    await post.save();
    res.json({ message: "Post reported successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error reporting post",
      error: error.message,
    });
  }
};

// Moderate a post (admin only)
exports.moderatePost = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    switch (action) {
      case "hidden":
        post.status = "hidden";
        break;
      case "restored":
        post.status = "published";
        break;
      case "deleted":
        post.status = "deleted";
        break;
      case "featured":
        post.featured = true;
        break;
      case "unfeatured":
        post.featured = false;
        break;
      default:
        return res.status(400).json({ message: "Invalid moderation action" });
    }

    post.moderationLog.push({
      action,
      moderator: req.user._id,
      reason,
    });

    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error moderating post",
      error: error.message,
    });
  }
};

// Vote on a poll
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.poll) {
      return res.status(400).json({ message: "This post has no poll" });
    }

    if (!post.isPollActive()) {
      return res.status(400).json({ message: "Poll has ended" });
    }

    if (
      !post.poll.allowMultipleVotes &&
      post.hasUserVotedOnPoll(req.user._id)
    ) {
      return res
        .status(400)
        .json({ message: "You have already voted on this poll" });
    }

    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({ message: "Invalid poll option" });
    }

    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();

    res.json({ post });
  } catch (error) {
    res.status(500).json({
      message: "Error voting on poll",
      error: error.message,
    });
  }
};
