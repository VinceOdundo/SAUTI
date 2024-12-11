import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import StatCard from "../components/admin/StatCard";
import VerificationRequests from "../components/admin/VerificationRequests";
import ReportedContent from "../components/admin/ReportedContent";
import UserManagement from "../components/admin/UserManagement";
import ActivityChart from "../components/admin/ActivityChart";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    users: {
      total: 0,
      verified: 0,
      pending: 0,
    },
    organizations: {
      total: 0,
      verified: 0,
      pending: 0,
    },
    representatives: {
      total: 0,
      verified: 0,
      pending: 0,
    },
    posts: {
      total: 0,
      reported: 0,
    },
    messages: {
      total: 0,
      today: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch admin stats
      // const { stats } = await getAdminStats();
      // setStats(stats);

      // Temporary mock data
      setStats({
        users: {
          total: 1250,
          verified: 980,
          pending: 45,
        },
        organizations: {
          total: 85,
          verified: 62,
          pending: 23,
        },
        representatives: {
          total: 150,
          verified: 120,
          pending: 30,
        },
        posts: {
          total: 3200,
          reported: 15,
        },
        messages: {
          total: 12500,
          today: 450,
        },
      });
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching admin stats");
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-500">
            You don't have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <ErrorAlert message={error} />
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "verification", name: "Verification Requests" },
    { id: "reports", name: "Reported Content" },
    { id: "users", name: "User Management" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </span>
            <button
              onClick={fetchStats}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Users"
              icon={UsersIcon}
              stats={[
                { label: "Total", value: stats.users.total },
                { label: "Verified", value: stats.users.verified },
                { label: "Pending", value: stats.users.pending },
              ]}
            />
            <StatCard
              title="Organizations"
              icon={BuildingOfficeIcon}
              stats={[
                { label: "Total", value: stats.organizations.total },
                { label: "Verified", value: stats.organizations.verified },
                { label: "Pending", value: stats.organizations.pending },
              ]}
            />
            <StatCard
              title="Representatives"
              icon={UserGroupIcon}
              stats={[
                { label: "Total", value: stats.representatives.total },
                { label: "Verified", value: stats.representatives.verified },
                { label: "Pending", value: stats.representatives.pending },
              ]}
            />
            <StatCard
              title="Forum Posts"
              icon={ChatBubbleLeftIcon}
              stats={[
                { label: "Total", value: stats.posts.total },
                { label: "Reported", value: stats.posts.reported },
              ]}
            />
            <StatCard
              title="Messages"
              icon={ChatBubbleLeftIcon}
              stats={[
                { label: "Total", value: stats.messages.total },
                { label: "Today", value: stats.messages.today },
              ]}
            />
            <StatCard
              title="Reports"
              icon={FlagIcon}
              stats={[
                { label: "Content", value: stats.posts.reported },
                { label: "Users", value: 8 },
              ]}
            />
          </div>
        )}

        {/* Activity Chart */}
        {activeTab === "overview" && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Platform Activity
              </h2>
              <ActivityChart />
            </div>
          </div>
        )}

        {/* Verification Requests */}
        {activeTab === "verification" && <VerificationRequests />}

        {/* Reported Content */}
        {activeTab === "reports" && <ReportedContent />}

        {/* User Management */}
        {activeTab === "users" && <UserManagement />}

        {/* Tab Navigation */}
        <div className="mt-8 border-t border-gray-200 pt-4">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
