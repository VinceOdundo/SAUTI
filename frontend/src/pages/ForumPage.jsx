import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import PostForm from "../components/PostForm";
import Timeline from "../components/Timeline";
import SuggestedProfiles from "../components/SuggestedProfiles";
import { toast } from "react-hot-toast";
import axios from "axios";

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useSelector((state) => state.auth);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/forum/posts?page=${pageNum}&limit=10`
      );
      setPosts((prev) =>
        pageNum === 1 ? response.data.posts : [...prev, ...response.data.posts]
      );
      setHasMore(response.data.currentPage < response.data.totalPages);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/forum/posts", newPost);
      setPosts([response.data.post, ...posts]);
      setNewPost({ title: "", content: "" });
    } catch (error) {
      setError(error.response?.data?.message || "Error creating post");
    }
  };

  const handleVote = useCallback(async (postId, voteType) => {
    try {
      const response = await axios.post(`/api/forum/posts/${postId}/vote`, {
        vote: voteType,
      });
      setPosts((prev) =>
        prev.map((post) => (post._id === postId ? response.data.post : post))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Error voting on post");
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      if (hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    }
  }, [hasMore, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <PostForm
            onPostCreated={(newPost) => setPosts([newPost, ...posts])}
          />
          <Timeline posts={posts} setPosts={setPosts} />
        </div>

        <div className="col-span-4 space-y-6">
          <SuggestedProfiles />
          <RepresentativePosts />
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
