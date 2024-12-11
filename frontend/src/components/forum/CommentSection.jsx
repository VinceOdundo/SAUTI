import React, { useState, useEffect, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { format, formatDistanceToNow } from "date-fns";
import {
  addComment,
  voteComment,
  deleteComment,
  trackAnalytics,
} from "../../features/forum/forumAPI";
import { toast } from "react-hot-toast";
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ReplyIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DotsVerticalIcon,
  FlagIcon,
} from "@heroicons/react/outline";
import { Menu, Transition } from "@headlessui/react";

// Memoized Comment component for better performance
const Comment = memo(
  ({
    comment,
    postId,
    onReply,
    onDelete,
    onReport,
    depth = 0,
    maxDepth = 5,
    parentChain = [],
  }) => {
    const { user } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [showReplies, setShowReplies] = useState(depth < 2);
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isReplying, setIsReplying] = useState(false);

    const hasLongContent = comment.content.length > 300;
    const voteScore =
      comment.votes.upvotes.length - comment.votes.downvotes.length;
    const hasVoted = {
      up: comment.votes.upvotes.includes(user?._id),
      down: comment.votes.downvotes.includes(user?._id),
    };

    // Memoized vote handler
    const handleVote = useCallback(
      async (type) => {
        if (!user) {
          toast.error("Please login to vote");
          return;
        }

        try {
          setIsLoading(true);
          await voteComment(postId, comment._id, type);
          trackAnalytics({
            type: `comment_${type}`,
            contentId: comment._id,
            contentType: "comment",
            userId: user._id,
            metadata: {
              postId,
              depth,
              parentChain,
            },
          });
          toast.success(
            `Vote ${type === "up" ? "added" : "removed"} successfully`
          );
        } catch (error) {
          console.error("Vote error:", error);
          toast.error(error.message || "Error voting on comment");
        } finally {
          setIsLoading(false);
        }
      },
      [user, postId, comment._id, depth, parentChain]
    );

    const handleReplySubmit = async (e) => {
      e.preventDefault();
      if (!replyContent.trim()) return;

      try {
        setIsLoading(true);
        await addComment(postId, {
          content: replyContent,
          parentId: comment._id,
          parentChain: [...parentChain, comment._id],
        });

        setReplyContent("");
        setIsReplying(false);
        trackAnalytics({
          type: "comment_reply_submit",
          contentId: comment._id,
          contentType: "comment",
          userId: user?._id,
          metadata: {
            postId,
            depth,
            parentChain,
            replyLength: replyContent.length,
          },
        });
      } catch (error) {
        console.error("Reply error:", error);
        toast.error(error.message || "Error posting reply");
      } finally {
        setIsLoading(false);
      }
    };

    const handleReplyClick = () => {
      setIsReplying(!isReplying);
      trackAnalytics({
        type: "comment_reply_start",
        contentId: comment._id,
        contentType: "comment",
        userId: user?._id,
        metadata: {
          postId,
          depth,
          parentChain,
        },
      });
    };

    const handleExpandContent = () => {
      setIsExpanded(true);
      trackAnalytics({
        type: "comment_expand",
        contentId: comment._id,
        contentType: "comment",
        userId: user?._id,
        metadata: {
          postId,
          depth,
          parentChain,
        },
      });
    };

    const handleToggleReplies = () => {
      setShowReplies(!showReplies);
      if (!showReplies) {
        trackAnalytics({
          type: "comment_replies_view",
          contentId: comment._id,
          contentType: "comment",
          userId: user?._id,
          metadata: {
            postId,
            depth,
            parentChain,
            replyCount: comment.replies?.length,
          },
        });
      }
    };

    const renderContent = () => {
      if (!hasLongContent || isExpanded) {
        return (
          <p className="mt-1 text-gray-800 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        );
      }

      return (
        <>
          <p className="mt-1 text-gray-800">
            {comment.content.slice(0, 300)}...
            <button
              onClick={handleExpandContent}
              className="ml-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Read more
            </button>
          </p>
        </>
      );
    };

    return (
      <div className="comment-thread">
        <div
          className={`flex space-x-3 ${
            depth > 0
              ? `ml-${Math.min(depth * 6, 12)} border-l-2 border-gray-100 pl-4`
              : ""
          }`}
        >
          <div className="flex-shrink-0">
            <img
              src={comment.author.avatar || "/default-avatar.png"}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full border-2 border-gray-200"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="bg-gray-50 rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 hover:text-primary-600 cursor-pointer">
                    {comment.author.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {comment.editedAt && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>

                <Menu as="div" className="relative">
                  <Menu.Button className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200">
                    <DotsVerticalIcon className="w-4 h-4 text-gray-500" />
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
                      {user?._id === comment.author._id ? (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => onDelete(comment._id)}
                              className={`${
                                active ? "bg-gray-100" : ""
                              } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Delete Comment
                            </button>
                          )}
                        </Menu.Item>
                      ) : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => onReport(comment._id)}
                              className={`${
                                active ? "bg-gray-100" : ""
                              } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                            >
                              <FlagIcon className="w-4 h-4 mr-2" />
                              Report Comment
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              {renderContent()}
            </div>

            <div className="flex items-center space-x-4 ml-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleVote("up")}
                  disabled={isLoading}
                  className={`p-1 rounded-full transition-colors duration-200 ${
                    hasVoted.up
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <ThumbUpIcon className="w-4 h-4" />
                </button>
                <span
                  className={`text-sm ${
                    voteScore > 0
                      ? "text-primary-600"
                      : voteScore < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {voteScore}
                </span>
                <button
                  onClick={() => handleVote("down")}
                  disabled={isLoading}
                  className={`p-1 rounded-full transition-colors duration-200 ${
                    hasVoted.down
                      ? "text-red-600 bg-red-50"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <ThumbDownIcon className="w-4 h-4" />
                </button>
              </div>

              {depth < maxDepth && (
                <button
                  onClick={handleReplyClick}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600"
                >
                  <ReplyIcon className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}

              {comment.replies?.length > 0 && (
                <button
                  onClick={handleToggleReplies}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600"
                >
                  {showReplies ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                  <span>
                    {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
                    {comment.replies.length === 1 ? "reply" : "replies"}
                  </span>
                </button>
              )}
            </div>

            {isReplying && (
              <form onSubmit={handleReplySubmit} className="mt-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !replyContent.trim()}
                    className="px-4 py-2 text-sm text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isLoading ? "Posting..." : "Post Reply"}
                  </button>
                </div>
              </form>
            )}

            {showReplies && comment.replies?.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    postId={postId}
                    onReply={onReply}
                    onDelete={onDelete}
                    onReport={onReport}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    parentChain={[...parentChain, comment._id]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Main CommentSection component
const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      setError("Failed to load comments");
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading comments...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Comment
          key={comment._id}
          comment={comment}
          postId={postId}
          onReply={(parentComment) => {
            /* handle reply */
          }}
          onDelete={(commentId) => {
            /* handle delete */
          }}
          onReport={(commentId) => {
            /* handle report */
          }}
          depth={0}
          parentChain={[]}
        />
      ))}
    </div>
  );
};

export default CommentSection;
