import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  forumStart,
  forumSuccess,
  forumFail,
  setPosts,
  setFilters,
} from "../features/forum/forumSlice";
import { getPosts } from "../features/forum/forumAPI";
import PostCard from "../components/forum/PostCard";
import ForumFilters from "../components/forum/ForumFilters";
import CreatePostButton from "../components/forum/CreatePostButton";
import Pagination from "../components/common/Pagination";
import SearchBar from "../components/common/SearchBar";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";

const ForumPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { posts, loading, error, pagination, filters } = useSelector(
    (state) => state.forum
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [filters, pagination.currentPage]);

  const fetchPosts = async () => {
    try {
      dispatch(forumStart());
      const data = await getPosts({
        ...filters,
        page: pagination.currentPage,
        search: searchQuery,
      });
      dispatch(setPosts(data));
      dispatch(forumSuccess());
    } catch (error) {
      dispatch(forumFail(error.response?.data?.message || error.message));
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    dispatch(setFilters({ search: query }));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handlePostClick = (postId) => {
    navigate(`/forum/posts/${postId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forum</h1>
          {user && user.isVerified && <CreatePostButton />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <ForumFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search posts..."
              />
            </div>

            {error && <ErrorAlert message={error} className="mb-6" />}

            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No posts found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onClick={() => handlePostClick(post._id)}
                  />
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => dispatch(setFilters({ page }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
