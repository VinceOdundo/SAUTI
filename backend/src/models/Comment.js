const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
      }
    ],
    votes: {
      upvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      downvotes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for vote count
commentSchema.virtual('voteCount').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Pre-remove middleware to clean up replies
commentSchema.pre('remove', async function(next) {
  try {
    // Remove all replies
    await this.model('Comment').deleteMany({ parentComment: this._id });
    
    // If this is a reply, remove it from parent's replies array
    if (this.parentComment) {
      const parentComment = await this.model('Comment').findById(this.parentComment);
      if (parentComment) {
        parentComment.replies.pull(this._id);
        await parentComment.save();
      }
    }
    
    // Remove from post's comments array
    const Post = mongoose.model('Post');
    await Post.findByIdAndUpdate(this.post, {
      $pull: { comments: this._id }
    });
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Comment", commentSchema);
