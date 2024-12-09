const Post = require("../models/Post");
const User = require("../models/User");

const createPost = async (req, res) => {
  try {
    const { title, content, location, media, poll, tags, parentPost } =
      req.body;

    if (!req.user.isVerified) {
      return res.status(403).json({
        message: "Account must be verified to create posts",
      });
    }

    const post = new Post({
      author: req.user._id,
      title,
      content,
      location: location || {},
      media: media || {},
      poll: poll || null,
      tags: tags || [],
      parentPost: parentPost || null,
      isRepost: !!parentPost,
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

const getPosts = async (req, res) => {
  try {
    const {
      county,
      constituency,
      ward,
      sort = "recent",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (county) query["location.county"] = county;
    if (constituency) query["location.constituency"] = constituency;
    if (ward) query["location.ward"] = ward;

    const sortOptions = {
      recent: { createdAt: -1 },
      popular: { voteCount: -1 },
    };

    const posts = await Post.find(query)
      .sort(sortOptions[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar")
      .populate("parentPost");

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message,
    });
  }
};

const votePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body; // 'up' or 'down'

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id;
    const hasUpvoted = post.votes.upvotes.includes(userId);
    const hasDownvoted = post.votes.downvotes.includes(userId);

    // Remove existing votes
    if (hasUpvoted) {
      post.votes.upvotes.pull(userId);
    }
    if (hasDownvoted) {
      post.votes.downvotes.pull(userId);
    }

    // Add new vote
    if (vote === "up" && !hasUpvoted) {
      post.votes.upvotes.push(userId);
    } else if (vote === "down" && !hasDownvoted) {
      post.votes.downvotes.push(userId);
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

module.exports = {
  createPost,
  getPosts,
  votePost,
};
