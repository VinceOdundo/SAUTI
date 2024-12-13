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
            <p className="font-medium text-primary hover:text-accent cursor-pointer">
              {post.author.name}
            </p>
            <div className="flex items-center space-x-2 text-sm text-secondary">
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {post.location && (
                <></>
              )}
            </div>
          </div>
        </div>

        {/* Category Badge */}
        {post.category && (
          <span className="px-3 py-1 text-sm font-medium text-accent bg-info-bg rounded-full">
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
        )}
      </div>

      {/* Post Content */}
      <div className="text-primary">
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-secondary">{post.content}</p>
      </div>

      {/* Post Media */}
      {post.media && (
        <div className="mt-2">
          <img
            src={post.media}
            alt="Post media"
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Post Location */}
      {post.location?.placeName && (
        <div className="mt-2 text-sm text-gray-500">
          📍 {post.location.placeName}
        </div>
      )}

      {/* Post Category and Tags */}
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {post.category}
        </span>
        {post.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Post Stats */}
      <div className="mt-4 flex items-center justify-between text-gray-500">
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={`flex items-center space-x-1 ${
            isLiked ? "text-blue-500" : ""
          }`}
        >
          <ThumbUpIcon className="h-5 w-5" />
          <span>{likeCount}</span>
        </button>

        <button
          className="flex items-center space-x-2 px-4 py-2 rounded-md text-secondary hover:bg-hover-bg transition-colors duration-200"
          onClick={() => handleShare()}
        >
          <ChatIcon className="w-5 h-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
