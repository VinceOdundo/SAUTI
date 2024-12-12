import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { likePost, unlikePost, sharePost } from "../features/forum/forumAPI";
import { updatePost } from "../features/forum/forumSlice";
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ChatIcon,
} from "@heroicons/react/24/outline";

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      setIsLoading(true);
      if (isLiked) {
        await unlikePost(post._id);
        setLikeCount((prev) => prev - 1);
      } else {
        await likePost(post._id);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
      dispatch(
        updatePost({ ...post, likes: isLiked ? likeCount - 1 : likeCount + 1 })
      );
    } catch (error) {
      toast.error(error.message || "Failed to update like");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await sharePost(post._id);
      toast.success("Post shared successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to share post");
    }
  };

  return (
    <div className="bg-base shadow rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow duration-200">
      {/* Author Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.avatar || "/default-avatar.png"}
            alt={post.author.name}
            className="h-10 w-10 rounded-full object-cover border-2 border-accent-primary"
          />
          <div>
            <p className="font-medium text-primary hover:text-accent-primary cursor-pointer">
              {post.author.name}
            </p>
            <div className="flex items-center space-x-2 text-sm text-secondary">
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {post.location && (
                <>
                  <span>•</span>
                  <span>{`${post.location.ward}, ${post.location.constituency}`}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Badge */}
        {post.category && (
          <span className="px-3 py-1 text-sm font-medium text-accent-primary bg-info-bg rounded-full">
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
        )}
      </div>

      {/* Post Content */}
      <div className="text-primary">
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-secondary">{post.content}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
            post.userVote === "up"
              ? "text-upvote bg-upvote-bg"
              : "text-secondary hover:bg-hover-bg"
          }`}
          onClick={() => handleVote("up")}
        >
          <ThumbUpIcon className="w-5 h-5" />
          <span>{post.upvotes || 0}</span>
        </button>

        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
            post.userVote === "down"
              ? "text-downvote bg-downvote-bg"
              : "text-secondary hover:bg-hover-bg"
          }`}
          onClick={() => handleVote("down")}
        >
          <ThumbDownIcon className="w-5 h-5" />
          <span>{post.downvotes || 0}</span>
        </button>

        <button
          className="flex items-center space-x-2 px-4 py-2 rounded-md text-secondary hover:bg-hover-bg transition-colors duration-200"
          onClick={() => setShowComments(!showComments)}
        >
          <ChatIcon className="w-5 h-5" />
          <span>{post.commentCount || 0} Comments</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
