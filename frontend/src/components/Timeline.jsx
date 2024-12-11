import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import { getPosts } from "../features/forum/forumAPI";
import { setPosts } from "../features/forum/forumSlice";
import PostCard from "./forum/PostCard";
import TimelineFilters from "./TimelineFilters";
import PostForm from "./PostForm";
import LoadingSpinner from "./common/LoadingSpinner";

const Timeline = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    sort: "recent",
    category: "all",
    timeRange: "all",
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = async (pageNum = 1, replace = false) => {
    if (loading || (!hasMore && pageNum > 1)) return;

    try {
      setLoading(true);
      const response = await getPosts({
        page: pageNum,
        limit: 10,
        ...filters,
      });

      const { posts, currentPage, totalPages, total } = response;

      if (replace) {
        dispatch(setPosts({ posts, currentPage, totalPages, total }));
      } else {
        dispatch(
          setPosts({
            posts: [...(pageNum === 1 ? [] : posts)],
            currentPage,
            totalPages,
            total,
          })
        );
      }

      setHasMore(posts.length === 10 && currentPage < totalPages);
      setPage(currentPage);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error(error.message || "Error fetching posts");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPosts(1, true);
  }, [filters]);

  // Infinite scroll
  useEffect(() => {
    if (inView && !loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [inView]);

  const handlePostCreated = (newPost) => {
    dispatch(
      setPosts({
        posts: [newPost, ...posts],
        currentPage: page,
        totalPages,
        total: total + 1,
      })
    );
    toast.success("Post created successfully!");
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {user && <PostForm onPostCreated={handlePostCreated} />}

      <TimelineFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
          setHasMore(true);
          setInitialLoading(true);
        }}
      />

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onUpdate={(updatedPost) => {
              if (!updatedPost) {
                // Post was deleted
                dispatch(
                  setPosts({
                    posts: posts.filter((p) => p._id !== post._id),
                    currentPage: page,
                    totalPages,
                    total: total - 1,
                  })
                );
              } else {
                // Post was updated
                dispatch(
                  setPosts({
                    posts: posts.map((p) =>
                      p._id === updatedPost._id ? updatedPost : p
                    ),
                    currentPage: page,
                    totalPages,
                    total,
                  })
                );
              }
            }}
          />
        ))}

        {/* Loading indicator */}
        <div ref={ref} className="py-4 text-center">
          {loading && <LoadingSpinner />}
          {!hasMore && posts.length > 0 && (
            <p className="text-gray-500">No more posts to load</p>
          )}
          {!loading && posts.length === 0 && (
            <p className="text-gray-500">No posts found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
