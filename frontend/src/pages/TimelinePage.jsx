import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../store/slices/forumSlice";
import Navigation from "../components/Navigation";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";

export default function TimelinePage() {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.forum);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Only fetch on initial load
    dispatch(fetchPosts({ page: 1 }));
  }, []); // Empty dependency array for initial load only

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreatePost />

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-6 mt-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {posts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No posts yet. Be the first to post something!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
