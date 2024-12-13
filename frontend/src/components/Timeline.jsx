import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../contexts/ToastContext";
import AppLayout from "./layouts/AppLayout";
import LoadingSpinner from "./common/LoadingSpinner";
import { formatDistanceToNow } from "date-fns";

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, following, local
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      const response = await fetch(
        `/posts?filter=${filter}&page=${pageNum}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts((prev) => [...prev, ...data.posts]);
        }
        setHasMore(data.hasMore);
      } else {
        showToast(data.message || "Failed to fetch posts", "error");
      }
    } catch (error) {
      showToast("Error fetching posts", "error");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setPage((prev) => prev + 1);
    fetchPosts(page + 1);
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? { ...post, likes: data.likes, isLiked: data.isLiked }
              : post
          )
        );
      } else {
        showToast(data.message || "Failed to like post", "error");
      }
    } catch (error) {
      showToast("Error liking post", "error");
    }
  };

  const handleShare = async (postId) => {
    try {
      const response = await fetch(`/posts/${postId}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        showToast("Post shared successfully", "success");
        setPosts(
          posts.map((post) =>
            post._id === postId ? { ...post, shares: data.shares } : post
          )
        );
      } else {
        showToast(data.message || "Failed to share post", "error");
      }
    } catch (error) {
      showToast("Error sharing post", "error");
    }
  };

  const renderFilters = () => (
    <div className="mb-6 border-b border-border">
      <nav className="flex space-x-8">
        {[
          { id: "all", label: "All Posts" },
          { id: "following", label: "Following" },
          { id: "local", label: "Local" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => {
              setFilter(id);
              setPage(1);
              setIsLoading(true);
            }}
            className={`px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
              filter === id
                ? "border-accent-primary text-accent -primary"
                : "border-transparent text-secondary hover:text-primary hover:border-border"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderPost = (post) => (
    <article
      key={post._id}
      className="p-6 bg-base border border-border rounded-lg mb-4 hover:border-border-hover transition-colors duration-200"
    >
      <div className="flex items-start space-x-3">
        <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
          <img
            src={post.author.profileImage || "/default-avatar.png"}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/profile/${post.author._id}`}
                className="font-medium text-primary hover:text-accent -primary"
              >
                {post.author.name}
              </Link>
              <p className="text-sm text-secondary">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {post.location && (
              <div className="text-sm text-secondary">
                📍 {post.location.ward}, {post.location.constituency}
              </div>
            )}
          </div>
          <p className="mt-2 text-primary whitespace-pre-wrap">
            {post.content}
          </p>
          {post.image && (
            <img
              src={post.image}
              alt="Post attachment"
              className="mt-3 rounded-lg max-h-96 w-full object-cover"
            />
          )}
          <div className="mt-4 flex items-center space-x-6">
            <button
              onClick={() => handleLike(post._id)}
              className={`flex items-center space-x-2 text-sm ${
                post.isLiked
                  ? "text-accent -primary"
                  : "text-secondary hover:text-accent -primary"
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
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{post.likes?.length || 0}</span>
            </button>
            <Link
              to={`/post/${post._id}`}
              className="flex items-center space-x-2 text-sm text-secondary hover:text-accent -primary"
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
                  strokeWidth="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </Link>
            <button
              onClick={() => handleShare(post._id)}
              className="flex items-center space-x-2 text-sm text-secondary hover:text-accent -primary"
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
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              <span>{post.shares || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {renderFilters()}
        <div className="space-y-4">
          {posts.length > 0 ? (
            <>
              {posts.map(renderPost)}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className={`px-4 py-2 text-sm text-primary bg-base-secondary hover:bg-hover-bg rounded-md transition-colors duration-200 ${
                      isLoadingMore ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary">No posts to show</p>
              {filter === "following" && (
                <p className="mt-2 text-secondary">
                  Try following some users to see their posts here
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Timeline;
