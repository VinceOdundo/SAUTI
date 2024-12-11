import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getOrganization,
  getOrganizationStats,
  getOrganizationRepresentatives,
  addRepresentative,
} from "../../features/organization/organizationAPI";
import LoadingSpinner from "../common/LoadingSpinner";

const OrganizationDashboard = () => {
  const { organizationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const [showAddRepForm, setShowAddRepForm] = useState(false);
  const [newRepData, setNewRepData] = useState({
    email: "",
    title: "",
    permissions: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [orgData, statsData, repsData] = await Promise.all([
          getOrganization(organizationId),
          getOrganizationStats(organizationId),
          getOrganizationRepresentatives(organizationId),
        ]);

        setOrganization(orgData.organization);
        setStats(statsData);
        setRepresentatives(repsData.representatives);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [organizationId]);

  const handleAddRepresentative = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addRepresentative(organizationId, newRepData);
      const repsData = await getOrganizationRepresentatives(organizationId);
      setRepresentatives(repsData.representatives);
      setShowAddRepForm(false);
      setNewRepData({ email: "", title: "", permissions: [] });
    } catch (err) {
      setError(err.message || "Failed to add representative");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission) => {
    setNewRepData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!organization) return <div>Organization not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organization.name} Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Organization Management and Analytics
            </p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                organization.verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {organization.verified ? "Verified" : "Pending Verification"}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Representatives
            </h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.representativesCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Posts</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.postsCount}
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

      {/* Representatives Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Representatives Management
          </h2>
          <button
            onClick={() => setShowAddRepForm(!showAddRepForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {showAddRepForm ? "Cancel" : "Add Representative"}
          </button>
        </div>

        {/* Add Representative Form */}
        {showAddRepForm && (
          <form onSubmit={handleAddRepresentative} className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={newRepData.email}
                  onChange={(e) =>
                    setNewRepData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newRepData.title}
                  onChange={(e) =>
                    setNewRepData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {[
                    "manage_posts",
                    "manage_representatives",
                    "view_analytics",
                    "manage_settings",
                  ].map((permission) => (
                    <div key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        id={permission}
                        checked={newRepData.permissions.includes(permission)}
                        onChange={() => handlePermissionChange(permission)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={permission}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        {permission.split("_").join(" ").toUpperCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
                >
                  {loading ? "Adding..." : "Add Representative"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Representatives List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {representatives.map((rep) => (
            <div
              key={rep._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                {rep.user.avatar && (
                  <img
                    src={rep.user.avatar}
                    alt={rep.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{rep.user.name}</h3>
                  <p className="text-sm text-gray-500">{rep.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {rep.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {permission.split("_").join(" ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
