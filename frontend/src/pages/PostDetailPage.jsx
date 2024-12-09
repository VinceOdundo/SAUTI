import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ShareIcon,
  FlagIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline";
import {
  ThumbUpIcon as ThumbUpSolidIcon,
  ThumbDownIcon as ThumbDownSolidIcon,
} from "@heroicons/react/solid";
import {
  getPost,
  votePost,
  addComment,
  voteComment,
  reportPost,
  votePoll,
} from "../features/forum/forumAPI";
import {
  setCurrentPost,
  updatePost,
  addComment as addCommentAction,
} from "../features/forum/forumSlice";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";
import Modal from "../components/common/Modal";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentPost, loading, error } = useSelector((state) => state.forum);
  const [comment, setComment] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { post } = await getPost(postId);
      dispatch(setCurrentPost(post));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching post");
    }
  };

  const handleVote = async (vote) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      const { post } = await votePost(postId, vote);
      dispatch(updatePost(post));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error voting on post");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const { post } = await addComment(postId, comment.trim());
      dispatch(updatePost(post));
      setComment("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding comment");
    }
  };

  const handleCommentVote = async (commentId, vote) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      const { post } = await voteComment(postId, commentId, vote);
      dispatch(updatePost(post));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error voting on comment");
    }
  };

  const handleReport = async () => {
    if (!user) {
      toast.error("Please log in to report");
      return;
    }

    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    try {
      setIsSubmitting(true);
      await reportPost(postId, reportReason.trim());
      toast.success("Post reported successfully");
      setIsReportModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error reporting post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePollVote = async (optionIndex) => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      const { post } = await votePoll(postId, optionIndex);
      dispatch(updatePost(post));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error voting on poll");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="text-center text-gray-500">Post not found</div>
      </div>
    );
  }

  const getVoteStatus = () => {
    if (!user) return null;
    const upvoted = currentPost.votes.upvotes.some(
      (id) => id.toString() === user._id.toString()
    );
    const downvoted = currentPost.votes.downvotes.some(
      (id) => id.toString() === user._id.toString()
    );
    return upvoted ? "up" : downvoted ? "down" : null;
  };

  const voteStatus = getVoteStatus();
  const voteCount =
    currentPost.votes.upvotes.length - currentPost.votes.downvotes.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/forum")}
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Forum
        </button>

        <div className="bg-white rounded-lg shadow">
          {/* Post header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={currentPost.author.avatar || "/default-avatar.png"}
                  alt={currentPost.author.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {currentPost.author.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(currentPost.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {currentPost.category && (
                  <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                    {currentPost.category}
                  </span>
                )}
                {currentPost.location?.county && (
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                    {currentPost.location.county}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {currentPost.title}
            </h1>

            <div className="prose max-w-none">{currentPost.content}</div>

            {/* Tags */}
            {currentPost.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media */}
          {(currentPost.media?.images?.length > 0 ||
            currentPost.media?.videos?.length > 0 ||
            currentPost.media?.documents?.length > 0) && (
            <div className="p-6 border-b">
              {/* Images */}
              {currentPost.media.images?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Images</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {currentPost.media.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.caption || `Image ${index + 1}`}
                          className="rounded-lg w-full h-64 object-cover"
                        />
                        {image.caption && (
                          <p className="mt-2 text-sm text-gray-500">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {currentPost.media.videos?.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-gray-900">Videos</h3>
                  <div className="space-y-4">
                    {currentPost.media.videos.map((video, index) => (
                      <div key={index}>
                        <video
                          src={video.url}
                          controls
                          className="w-full rounded-lg"
                          poster={video.thumbnail}
                        />
                        {video.caption && (
                          <p className="mt-2 text-sm text-gray-500">
                            {video.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {currentPost.media.documents?.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-gray-900">Documents</h3>
                  <div className="space-y-2">
                    {currentPost.media.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <span className="flex-1">{doc.name}</span>
                        <span className="text-sm text-gray-500">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Poll */}
          {currentPost.poll && (
            <div className="p-6 border-b">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-6 h-6 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Poll</h3>
                </div>

                <p className="text-lg font-medium">
                  {currentPost.poll.question}
                </p>

                <div className="space-y-3">
                  {currentPost.poll.options.map((option, index) => {
                    const totalVotes = currentPost.poll.options.reduce(
                      (sum, opt) => sum + opt.votes.length,
                      0
                    );
                    const votePercentage =
                      totalVotes === 0
                        ? 0
                        : (option.votes.length / totalVotes) * 100;
                    const hasVoted = user && option.votes.includes(user._id);

                    return (
                      <div key={index} className="space-y-2">
                        <button
                          onClick={() => handlePollVote(index)}
                          disabled={
                            !currentPost.isPollActive() ||
                            (!currentPost.poll.allowMultipleVotes &&
                              currentPost.hasUserVotedOnPoll(user?._id))
                          }
                          className={`w-full p-3 rounded-lg border ${
                            hasVoted
                              ? "bg-blue-50 border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between">
                            <span>{option.text}</span>
                            <span className="font-medium">
                              {votePercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${votePercentage}%` }}
                            />
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {option.votes.length} votes
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="text-sm text-gray-500">
                  {currentPost.isPollActive() ? (
                    <>
                      Poll ends{" "}
                      {formatDistanceToNow(new Date(currentPost.poll.endDate), {
                        addSuffix: true,
                      })}
                    </>
                  ) : (
                    "Poll has ended"
                  )}
                  {currentPost.poll.allowMultipleVotes && (
                    <span className="ml-2">• Multiple votes allowed</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote("up")}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    voteStatus === "up" ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {voteStatus === "up" ? (
                    <ThumbUpSolidIcon className="w-6 h-6" />
                  ) : (
                    <ThumbUpIcon className="w-6 h-6" />
                  )}
                </button>
                <span className="text-gray-600 font-medium">{voteCount}</span>
                <button
                  onClick={() => handleVote("down")}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    voteStatus === "down" ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {voteStatus === "down" ? (
                    <ThumbDownSolidIcon className="w-6 h-6" />
                  ) : (
                    <ThumbDownIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
              <div className="text-gray-500">
                {currentPost.comments?.length || 0} comments
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
              >
                <FlagIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Comments</h3>

            {/* Comment form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">
                  Please{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    log in
                  </button>{" "}
                  to comment
                </p>
              </div>
            )}

            {/* Comments list */}
            <div className="space-y-6">
              {currentPost.comments
                ?.filter((comment) => comment.status === "active")
                .map((comment) => {
                  const commentVoteCount =
                    comment.votes.upvotes.length -
                    comment.votes.downvotes.length;
                  const commentVoteStatus = user
                    ? comment.votes.upvotes.includes(user._id)
                      ? "up"
                      : comment.votes.downvotes.includes(user._id)
                      ? "down"
                      : null
                    : null;

                  return (
                    <div key={comment._id} className="flex space-x-4">
                      <img
                        src={comment.author.avatar || "/default-avatar.png"}
                        alt={comment.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium text-gray-900">
                                {comment.author.name}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                {formatDistanceToNow(
                                  new Date(comment.createdAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600">{comment.content}</p>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleCommentVote(comment._id, "up")
                              }
                              className={`p-1 rounded hover:bg-gray-100 ${
                                commentVoteStatus === "up"
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {commentVoteStatus === "up" ? (
                                <ThumbUpSolidIcon className="w-4 h-4" />
                              ) : (
                                <ThumbUpIcon className="w-4 h-4" />
                              )}
                            </button>
                            <span className="text-sm text-gray-600">
                              {commentVoteCount}
                            </span>
                            <button
                              onClick={() =>
                                handleCommentVote(comment._id, "down")
                              }
                              className={`p-1 rounded hover:bg-gray-100 ${
                                commentVoteStatus === "down"
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {commentVoteStatus === "down" ? (
                                <ThumbDownSolidIcon className="w-4 h-4" />
                              ) : (
                                <ThumbDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Post"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for reporting this post:
          </p>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={4}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your reason..."
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleReport}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PostDetailPage;
