import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import AppLayout from "../layouts/AppLayout";
import axios from "axios";

const UserDashboard = () => {
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    engagement: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        axios.get("/api/users/stats"),
        axios.get("/api/users/activity"),
      ]);
      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch dashboard data",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-secondary text-sm">{title}</p>
          <p className="text-2xl font-semibold text-primary mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-accent-primary bg-opacity-10 flex items-center justify-center text-accent-primary">
          {icon}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case "post":
          return (
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          );
        case "like":
          return (
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          );
        case "comment":
          return (
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
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center space-x-4 p-4 hover:bg-hover-bg rounded-lg transition-base">
        <div className="w-10 h-10 rounded-full bg-base-secondary flex items-center justify-center text-secondary">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-primary truncate">
            {activity.type === "post"
              ? "Created a new post"
              : activity.type === "like"
              ? "Liked a post"
              : "Commented on a post"}
          </p>
          <p className="text-sm text-secondary">
            {new Date(activity.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Link
          to={`/posts/${activity.postId}`}
          className="text-accent-primary hover:text-accent-secondary transition-base"
        >
          View
        </Link>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <p className="text-secondary mt-1">
              Welcome back, {user?.username}
            </p>
          </div>
          <Link to="/profile" className="btn btn-primary">
            Edit Profile
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Posts"
            value={stats.posts}
            icon={
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
          />
          <StatCard
            title="Followers"
            value={stats.followers}
            icon={
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Following"
            value={stats.following}
            icon={
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
          />
          <StatCard
            title="Engagement Rate"
            value={`${stats.engagement}%`}
            icon={
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
          />
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-primary">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="p-6 text-center text-secondary">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserDashboard;
