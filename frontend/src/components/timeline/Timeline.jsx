import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import PostForm from "../post/PostForm";
import axios from "axios";

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, following, local
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/posts?filter=${filter}`);
      setPosts(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch posts",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, ...response.data } : post
        )
      );
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to like post",
        "error"
      );
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, {
        content,
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, response.data],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to add comment",
        "error"
      );
    }
  };

  const handleShare = async (postId) => {
    try {
      await navigator.share({
        title: "Share Post",
        text: "Check out this post on Sauti",
        url: `${window.location.origin}/posts/${postId}`,
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        showToast("Failed to share post", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Post Form */}
      <PostForm onPost={fetchPosts} />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
              filter === "all"
                ? "bg-accent-primary text-white"
                : "text-secondary hover:text-primary hover:bg-hover-bg"
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter("following")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
              filter === "following"
                ? "bg-accent-primary text-white"
                : "text-secondary hover:text-primary hover:bg-hover-bg"
            }`}
          >
            Following
          </button>
          <button
            onClick={() => setFilter("local")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-base ${
              filter === "local"
                ? "bg-accent-primary text-white"
                : "text-secondary hover:text-primary hover:bg-hover-bg"
            }`}
          >
            Local
          </button>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-info-bg text-info-text mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            No Posts Yet
          </h3>
          <p className="text-secondary">
            {filter === "following"
              ? "Follow more people to see their posts here"
              : filter === "local"
              ? "No posts from your area yet"
              : "Be the first to post something"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="card p-6 space-y-4">
              {/* Post Header */}
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${post.author.id}`}>
                  <img
                    src={post.author.profileImage || "/default-avatar.png"}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>
                <div>
                  <Link
                    to={`/profile/${post.author.id}`}
                    className="font-medium text-primary hover:text-accent-primary transition-base"
                  >
                    {post.author.username}
                  </Link>
                  <p className="text-sm text-secondary">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-4">
                <p className="text-primary whitespace-pre-wrap">
                  {post.content}
                </p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="rounded-lg max-h-96 w-full object-cover"
                  />
                )}
              </div>

              {/* Post Actions */}
              <div className="flex items-center space-x-6 pt-4 border-t border-border">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-2 text-sm transition-base ${
                    post.isLiked
                      ? "text-accent-primary"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={post.isLiked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span>{post.likeCount}</span>
                </button>

                <Link
                  to={`/posts/${post.id}`}
                  className="flex items-center space-x-2 text-sm text-secondary hover:text-primary transition-base"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span>{post.commentCount}</span>
                </Link>

                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-2 text-sm text-secondary hover:text-primary transition-base"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              {/* Comments Preview */}
              {post.comments?.length > 0 && (
                <div className="pt-4 space-y-4">
                  {post.comments.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Link to={`/profile/${comment.author.id}`}>
                        <img
                          src={
                            comment.author.profileImage || "/default-avatar.png"
                          }
                          alt={comment.author.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 bg-base-secondary rounded-lg p-3">
                        <Link
                          to={`/profile/${comment.author.id}`}
                          className="font-medium text-primary hover:text-accent-primary transition-base"
                        >
                          {comment.author.username}
                        </Link>
                        <p className="text-primary mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {post.comments.length > 2 && (
                    <Link
                      to={`/posts/${post.id}`}
                      className="block text-sm text-secondary hover:text-accent-primary transition-base"
                    >
                      View all {post.comments.length} comments
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;
