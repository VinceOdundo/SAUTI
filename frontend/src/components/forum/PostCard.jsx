import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ShareIcon,
  ChatIcon,
  DotsHorizontalIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  LocationMarkerIcon,
} from "@heroicons/react/outline";
import { Menu, Transition } from "@headlessui/react";
import { Link } from "react-router-dom";
import {
  votePost,
  deletePost,
  reportPost,
  resharePost,
  likePost,
  unlikePost,
  sharePost,
  trackAnalytics,
} from "../../features/forum/forumAPI";
import { updatePost } from "../../features/forum/forumSlice";
import PostMedia from "../post-components/PostMedia";
import PostPoll from "../post-components/PostPoll";
import PostLocation from "../post-components/PostLocation";
import CommentSection from "./CommentSection";
import ReshareModal from "./ReshareModal";
import ReportModal from "./ReportModal";
import { toast } from "react-toastify";

const PostCard = ({ post, onEdit, onUpdate }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReshareModal, setShowReshareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isAuthor = user?._id === post.author._id;
  const hasVoted = {
    up: post.votes.upvotes.includes(user?._id),
    down: post.votes.downvotes.includes(user?._id),
  };

  const voteScore = post.votes.upvotes.length - post.votes.downvotes.length;
  const contentPreviewLength = 280;
  const hasLongContent = post.content.length > contentPreviewLength;

  // Track view on mount
  useEffect(() => {
    if (user) {
      trackAnalytics({
        type: "view",
        contentId: post._id,
        contentType: "post",
        userId: user._id,
      });
    }
  }, [post._id, user]);

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
        trackAnalytics({
          type: "unlike",
          contentId: post._id,
          contentType: "post",
          userId: user._id,
        });
      } else {
        await likePost(post._id);
        setLikeCount((prev) => prev + 1);
        trackAnalytics({
          type: "like",
          contentId: post._id,
          contentType: "post",
          userId: user._id,
        });
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
      trackAnalytics({
        type: "share",
        contentId: post._id,
        contentType: "post",
        userId: user?._id,
      });
      toast.success("Post shared successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to share post");
    }
  };

  const handleCommentToggle = () => {
    setShowComments(!showComments);
    if (!showComments) {
      trackAnalytics({
        type: "comment_view",
        contentId: post._id,
        contentType: "post",
        userId: user?._id,
      });
    }
  };

  const handleContentExpand = () => {
    setIsExpanded(true);
    trackAnalytics({
      type: "content_expand",
      contentId: post._id,
      contentType: "post",
      userId: user?._id,
    });
  };

  const handleProfileClick = () => {
    trackAnalytics({
      type: "profile_click",
      contentId: post.author._id,
      contentType: "user",
      userId: user?._id,
    });
  };

  const handleVote = async (type) => {
    if (!user) {
      toast.error("Please login to vote");
      return;
    }

    try {
      setIsLoading(true);
      await votePost(post._id, type);
      toast.success(`Post ${type}voted successfully`);
    } catch (error) {
      toast.error(error.message || "Failed to vote");
      console.error("Vote error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setIsLoading(true);
        await deletePost(post._id);
        toast.success("Post deleted successfully");
        onUpdate && onUpdate(null); // Notify parent about deletion
      } catch (error) {
        toast.error(error.message || "Failed to delete post");
        console.error("Delete error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReport = async (reason) => {
    try {
      setIsLoading(true);
      await reportPost(post._id, reason);
      setShowReportModal(false);
      toast.success("Post reported successfully");
    } catch (error) {
      toast.error(error.message || "Failed to report post");
      console.error("Report error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReshare = async (commentary) => {
    try {
      setIsLoading(true);
      await resharePost(post._id, commentary);
      setShowReshareModal(false);
      toast.success("Post reshared successfully");
    } catch (error) {
      toast.error(error.message || "Failed to reshare post");
      console.error("Reshare error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 mb-4">
      {/* Post Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
            <img
              src={post.author.avatar || "/default-avatar.png"}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary-100 hover:border-primary-300 transition-colors duration-200"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${post.author._id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
            >
              {post.author.name}
            </Link>
            <div className="flex items-center text-sm text-gray-500 space-x-2">
              <PostLocation location={post.location} />
              <span>•</span>
              {formatDistanceToNow(new Date(post.createdAt))}
              {post.editHistory?.length > 0 && (
                <span className="ml-1 text-primary-500">(edited)</span>
              )}
            </div>
          </div>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <DotsHorizontalIcon className="w-5 h-5 text-gray-500" />
          </Menu.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
              {isAuthor ? (
                <>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-100" : ""
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors duration-200`}
                        onClick={() => onEdit(post)}
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Post
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-gray-100" : ""
                        } flex w-full items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors duration-200`}
                        onClick={handleDelete}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        Delete Post
                      </button>
                    )}
                  </Menu.Item>
                </>
              ) : (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? "bg-gray-100" : ""
                      } flex w-full items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors duration-200`}
                      onClick={() => setShowReportModal(true)}
                    >
                      <FlagIcon className="w-4 h-4 mr-2" />
                      Report Post
                    </button>
                  )}
                </Menu.Item>
              )}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Post Content */}
      <Link to={`/posts/${post._id}`} className="block group">
        {post.title && (
          <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
            {post.title}
          </h2>
        )}
        <div className="text-gray-800 mb-4">
          {hasLongContent && !isExpanded ? (
            <>
              <p>{post.content.slice(0, contentPreviewLength)}...</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleContentExpand();
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1"
              >
                Read more
              </button>
            </>
          ) : (
            <p className="whitespace-pre-wrap">{post.content}</p>
          )}
        </div>
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`/posts?tag=${tag}`}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Media */}
      {post.media && <PostMedia media={post.media} />}

      {/* Poll */}
      {post.poll && <PostPoll poll={post.poll} postId={post._id} />}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4 mb-2">
        <div className="flex space-x-4">
          <span className="flex items-center">
            <ChartBarIcon className="w-4 h-4 mr-1" />
            {voteScore} votes
          </span>
          <span className="flex items-center">
            <ChatIcon className="w-4 h-4 mr-1" />
            {post.comments?.length || 0} comments
          </span>
          <span className="flex items-center">
            <ShareIcon className="w-4 h-4 mr-1" />
            {post.reshares?.length || 0} reshares
          </span>
        </div>
        <span className="flex items-center">
          <LocationMarkerIcon className="w-4 h-4 mr-1" />
          {post.analytics?.views || 0} views
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between border-t border-b border-gray-100 py-2 mt-4">
        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
            hasVoted.up
              ? "text-primary-600 bg-primary-50"
              : "text-gray-600 hover:bg-gray-50"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleVote("up")}
          disabled={isLoading}
        >
          <ThumbUpIcon className="w-5 h-5" />
          <span>Upvote</span>
        </button>

        <button
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
            hasVoted.down
              ? "text-red-600 bg-red-50"
              : "text-gray-600 hover:bg-gray-50"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleVote("down")}
          disabled={isLoading}
        >
          <ThumbDownIcon className="w-5 h-5" />
          <span>Downvote</span>
        </button>

        <button
          className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          onClick={handleCommentToggle}
        >
          <ChatIcon className="w-5 h-5" />
          <span>Comment</span>
        </button>

        <button
          className="flex items-center space-x-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setShowReshareModal(true)}
        >
          <ShareIcon className="w-5 h-5" />
          <span>Reshare</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4">
          <CommentSection postId={post._id} />
        </div>
      )}

      {/* Modals */}
      {showReshareModal && (
        <ReshareModal
          post={post}
          onClose={() => setShowReshareModal(false)}
          onReshare={handleReshare}
          isLoading={isLoading}
        />
      )}

      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onReport={handleReport}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default PostCard;
