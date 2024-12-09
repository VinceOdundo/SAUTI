import { useState, useMemo, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import PostMedia from "./post-components/PostMedia";
import PostPoll from "./post-components/PostPoll";
import PostLocation from "./post-components/PostLocation";
import LazyLoadImage from "react-lazy-load-image-component";

const PostCard = memo(({ post, onUpdate }) => {
  const { user } = useSelector((state) => state.auth);
  const [showActions, setShowActions] = useState(false);

  // Memoize expensive calculations
  const formattedDate = useMemo(
    () => formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }),
    [post.createdAt]
  );

  // Memoize event handlers
  const handleVote = useCallback(
    (type) => {
      onUpdate(post._id, type);
    },
    [post._id, onUpdate]
  );

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`/api/forum/posts/${post._id}`);
      toast.success("Post deleted successfully");
      // Remove post from the timeline
      onUpdate(null);
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.origin + `/post/${post._id}`,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          window.location.origin + `/post/${post._id}`
        );
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      toast.error("Error sharing post");
    }
  };

  return (
    <div className="bg-dark-700 rounded-lg p-6">
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-4">
        <LazyLoadImage
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full"
          placeholder={<div className="w-10 h-10 bg-dark-600 rounded-full" />}
          threshold={100}
        />
        <div>
          <Link
            to={`/profile/${post.author._id}`}
            className="font-medium text-white hover:underline"
          >
            {post.author.name}
          </Link>
          <p className="text-sm text-gray-400">{formattedDate}</p>
        </div>
      </div>

      {/* Post Content */}
      <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
      <p className="text-gray-300 mb-4">{post.content}</p>

      {/* Post Media/Poll/Location */}
      {post.media && <PostMedia media={post.media} />}
      {post.poll && (
        <PostPoll poll={post.poll} postId={post._id} onUpdate={onUpdate} />
      )}
      {post.location && <PostLocation location={post.location} />}

      {/* Post Stats & Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-600">
        <div className="flex gap-4">
          <button
            onClick={() => handleVote("upvote")}
            className={`flex items-center gap-1 ${
              post.votes.upvotes.includes(user._id)
                ? "text-primary-500"
                : "text-gray-400 hover:text-primary-500"
            }`}
          >
            <i className="icon-arrow-up" />
            {post.votes.upvotes.length}
          </button>
          <button
            onClick={() => handleVote("downvote")}
            className={`flex items-center gap-1 ${
              post.votes.downvotes.includes(user._id)
                ? "text-red-500"
                : "text-gray-400 hover:text-red-500"
            }`}
          >
            <i className="icon-arrow-down" />
            {post.votes.downvotes.length}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleShare}
            className="text-gray-400 hover:text-white"
          >
            <i className="icon-share" />
          </button>
          {post.author._id === user._id && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-gray-400 hover:text-white"
              >
                <i className="icon-dots-vertical" />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-600 rounded-lg shadow-lg py-1">
                  <button
                    onClick={() => {
                      handleDelete;
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-dark-500"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default PostCard;
