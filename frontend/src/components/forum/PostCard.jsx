import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ChatIcon,
  ShareIcon,
  FlagIcon,
  ChartBarIcon,
} from "@heroicons/react/outline";
import {
  ThumbUpIcon as ThumbUpSolidIcon,
  ThumbDownIcon as ThumbDownSolidIcon,
} from "@heroicons/react/solid";
import { votePost } from "../../features/forum/forumAPI";
import { updatePost } from "../../features/forum/forumSlice";
import { toast } from "react-toastify";

const PostCard = ({ post, onClick }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleVote = async (e, vote) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      const { post: updatedPost } = await votePost(post._id, vote);
      dispatch(updatePost(updatedPost));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error voting on post");
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/forum/posts/${post._id}`
    );
    toast.success("Link copied to clipboard");
  };

  const getVoteStatus = () => {
    if (!user) return null;
    const upvoted = post.votes.upvotes.some(
      (id) => id.toString() === user._id.toString()
    );
    const downvoted = post.votes.downvotes.some(
      (id) => id.toString() === user._id.toString()
    );
    return upvoted ? "up" : downvoted ? "down" : null;
  };

  const voteStatus = getVoteStatus();
  const voteCount = post.votes.upvotes.length - post.votes.downvotes.length;

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar || "/default-avatar.png"}
              alt={post.author.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.category && (
              <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                {post.category}
              </span>
            )}
            {post.location?.county && (
              <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                {post.location.county}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {post.title}
        </h2>
        <p className="text-gray-600 line-clamp-3">{post.content}</p>

        {/* Media preview */}
        {(post.media?.images?.length > 0 ||
          post.media?.videos?.length > 0 ||
          post.media?.documents?.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.media.images?.slice(0, 2).map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.caption || "Post image"}
                className="w-24 h-24 object-cover rounded"
              />
            ))}
            {post.media.images?.length > 2 && (
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">
                  +{post.media.images.length - 2}
                </span>
              </div>
            )}
            {post.media.videos?.length > 0 && (
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">
                  {post.media.videos.length} video(s)
                </span>
              </div>
            )}
            {post.media.documents?.length > 0 && (
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">
                  {post.media.documents.length} document(s)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Poll preview */}
        {post.poll && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900">Poll</span>
            </div>
            <p className="text-gray-600 mb-2">{post.poll.question}</p>
            <div className="text-sm text-gray-500">
              {post.poll.options.length} options •{" "}
              {post.poll.options.reduce(
                (total, option) => total + option.votes.length,
                0
              )}{" "}
              votes
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => handleVote(e, "up")}
                className={`p-1 rounded hover:bg-gray-100 ${
                  voteStatus === "up" ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {voteStatus === "up" ? (
                  <ThumbUpSolidIcon className="w-5 h-5" />
                ) : (
                  <ThumbUpIcon className="w-5 h-5" />
                )}
              </button>
              <span className="text-gray-600 font-medium">{voteCount}</span>
              <button
                onClick={(e) => handleVote(e, "down")}
                className={`p-1 rounded hover:bg-gray-100 ${
                  voteStatus === "down" ? "text-red-600" : "text-gray-500"
                }`}
              >
                {voteStatus === "down" ? (
                  <ThumbDownSolidIcon className="w-5 h-5" />
                ) : (
                  <ThumbDownIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <ChatIcon className="w-5 h-5" />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShare}
              className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            >
              <ShareIcon className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement report functionality
              }}
              className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            >
              <FlagIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
