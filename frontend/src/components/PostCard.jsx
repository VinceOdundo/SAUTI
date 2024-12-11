import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { likePost, unlikePost, sharePost } from "../features/forum/forumAPI";
import { updatePost } from "../features/forum/forumSlice";

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
    <div className="bg-white shadow rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow duration-200">
      {/* Author Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.avatar || "/default-avatar.png"}
            alt={post.author.name}
            className="h-10 w-10 rounded-full object-cover border-2 border-primary-100"
          />
          <div>
            <p className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
              {post.author.name}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
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
          <span className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-full">
            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
        )}
      </div>

      {/* Post Title */}
      {post.title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {post.title}
        </h2>
      )}

      {/* Post Content */}
      <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post attachment ${index + 1}`}
              className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90"
              onClick={() => window.open(image, "_blank")}
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Engagement Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-1 ${
              isLiked ? "text-primary-600" : "text-gray-500"
            } hover:text-primary-600 transition-colors duration-200`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => {}}
            className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
