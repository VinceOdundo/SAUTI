import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getStats,
  getActivityTrends,
  getSystemHealth,
} from "../../features/admin/adminAPI";
import LoadingSpinner from "../common/LoadingSpinner";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, trendsData, healthData] = await Promise.all([
          getStats(),
          getActivityTrends(timeRange),
          getSystemHealth(),
        ]);

        setStats(statsData);
        setTrends(trendsData);
        setSystemHealth(healthData);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Platform Overview and Management
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/admin/verifications"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Verification Requests
            </Link>
            <Link
              to="/admin/moderation"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Content Moderation
            </Link>
          </div>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Server Status
              </h3>
              <div className="mt-1 flex items-center">
                <span
                  className={`h-3 w-3 rounded-full ${
                    systemHealth.status === "healthy"
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                ></span>
                <span className="ml-2 text-sm text-gray-900 capitalize">
                  {systemHealth.status}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {systemHealth.cpuUsage}%
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Memory Usage
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {systemHealth.memoryUsage}%
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Response Time
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {systemHealth.responseTime}ms
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalUsers}
            </p>
            <p className="mt-1 text-sm text-green-600">
              +{stats.newUsers} this week
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Organizations</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalOrganizations}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {stats.pendingVerifications} pending verifications
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Representatives
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalRepresentatives}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {stats.activeRepresentatives} active this week
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">Content</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalPosts}
            </p>
            <p className="mt-1 text-sm text-red-600">
              {stats.reportedContent} reported items
            </p>
          </div>
        </div>
      )}

      {/* Activity Trends */}
      {trends && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Activity Trends
            </h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="ml-4 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                User Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    New Registrations
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {trends.newUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trends.activeUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trends.engagementRate}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Content Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Posts</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trends.newPosts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trends.comments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reports</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trends.reports}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <p className="mt-2 text-sm text-gray-500">
            Manage user accounts, roles, and permissions
          </p>
        </Link>
        <Link
          to="/admin/organizations"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900">
            Organization Management
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Review and manage organization profiles
          </p>
        </Link>
        <Link
          to="/admin/settings"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900">
            Platform Settings
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Configure platform settings and features
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
