import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PostForm from "../components/PostForm";
import Timeline from "../components/Timeline";
import SuggestedProfiles from "../components/SuggestedProfiles";
import RepresentativePosts from "../components/RepresentativePosts";
import { BellIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

const HomePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    notifications: { unread: 0 },
    messages: { unread: 0 },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your community
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="h-6 w-6" />
              {stats.notifications.unread > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <ChatBubbleLeftIcon className="h-6 w-6" />
              {stats.messages.unread > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Quick Stats */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Your Activity
                </h2>
                <div className="space-y-4">
                  {/* Activity stats */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Posts</span>
                    <span className="text-sm font-medium text-gray-900">
                      24
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Comments</span>
                    <span className="text-sm font-medium text-gray-900">
                      128
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Following</span>
                    <span className="text-sm font-medium text-gray-900">
                      56
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-6">
            <PostForm
              onPostCreated={(newPost) => setPosts([newPost, ...posts])}
            />
            <Timeline posts={posts} setPosts={setPosts} />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <SuggestedProfiles />
            <RepresentativePosts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
