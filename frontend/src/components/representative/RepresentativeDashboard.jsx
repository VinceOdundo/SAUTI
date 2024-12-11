import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getRepresentative,
  getRepresentativeStats,
  getRepresentativeActivities,
} from "../../features/representative/representativeAPI";
import LoadingSpinner from "../common/LoadingSpinner";
import CreatePost from "../CreatePost";

const RepresentativeDashboard = () => {
  const { representativeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [representative, setRepresentative] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");
  const [selectedActivityType, setSelectedActivityType] = useState("all");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [repData, statsData, activitiesData] = await Promise.all([
          getRepresentative(representativeId),
          getRepresentativeStats(representativeId),
          getRepresentativeActivities(representativeId),
        ]);

        setRepresentative(repData.representative);
        setStats(statsData);
        setActivities(activitiesData.activities);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [representativeId]);

  const filterActivities = () => {
    return activities.filter((activity) => {
      if (
        selectedActivityType !== "all" &&
        activity.type !== selectedActivityType
      ) {
        return false;
      }

      const activityDate = new Date(activity.createdAt);
      const now = new Date();
      const diffInDays = (now - activityDate) / (1000 * 60 * 60 * 24);

      switch (selectedTimeRange) {
        case "day":
          return diffInDays <= 1;
        case "week":
          return diffInDays <= 7;
        case "month":
          return diffInDays <= 30;
        default:
          return true;
      }
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!representative) return <div>Representative not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {representative.user.name}
            </p>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create Post
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Posts</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.postsCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Followers</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.followersCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Engagements</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.engagementsCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Avg. Response Time
            </h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.avgResponseTime || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Activity Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type
            </label>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Activities</option>
              <option value="post">Posts</option>
              <option value="comment">Comments</option>
              <option value="engagement">Engagements</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-6">
          {filterActivities().map((activity) => (
            <div
              key={activity._id}
              className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-gray-900">{activity.description}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{activity.type}</span>
                    {activity.location && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{activity.location}</span>
                      </>
                    )}
                  </div>
                  {activity.engagement && (
                    <div className="mt-2 text-sm text-gray-500">
                      {activity.engagement.likes} likes •{" "}
                      {activity.engagement.comments} comments
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="min-h-screen px-4 text-center">
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create Post
                </h3>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <CreatePost onClose={() => setShowCreatePost(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentativeDashboard;
