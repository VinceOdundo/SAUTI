import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";
import axios from "axios";
import PostCard from "./PostCard";
import TimelineFilters from "./TimelineFilters";

const Timeline = ({ posts, setPosts }) => {
  const [loading, setLoading] = useState(false);
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

  const fetchPosts = async (pageNum = 1) => {
    if (loading || (!hasMore && pageNum > 1)) return;

    setLoading(true);
    try {
      const response = await axios.get("/api/forum/posts", {
        params: {
          page: pageNum,
          limit: 10,
          ...filters,
        },
      });

      const newPosts = response.data.posts;
      setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      toast.error("Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [filters]);

  useEffect(() => {
    if (inView) {
      fetchPosts(page + 1);
    }
  }, [inView]);

  return (
    <div className="space-y-4">
      <TimelineFilters
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
      />

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onUpdate={(updatedPost) => {
            if (!updatedPost) {
              // Post was deleted
              setPosts((prev) => prev.filter((p) => p._id !== post._id));
            } else {
              // Post was updated
              setPosts((prev) =>
                prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
              );
            }
          }}
        />
      ))}

      {/* Loading indicator */}
      <div ref={ref} className="py-4 text-center">
        {loading && <div className="text-gray-400">Loading more posts...</div>}
        {!hasMore && <div className="text-gray-400">No more posts to load</div>}
      </div>
    </div>
  );
};

export default Timeline;
