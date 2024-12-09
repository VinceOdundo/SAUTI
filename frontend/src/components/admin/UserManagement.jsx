import React, { useState, useEffect } from "react";
import {
  SearchIcon,
  FilterIcon,
  BanIcon,
  UserCircleIcon,
  KeyIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { toast } from "react-toastify";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    verified: "all",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch users
      // const { users } = await getUsers({ ...filters, search: searchQuery });
      // setUsers(users);

      // Mock data
      setUsers([
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          role: "user",
          status: "active",
          verified: true,
          createdAt: "2023-08-01T10:00:00Z",
          lastLogin: "2023-08-15T15:30:00Z",
          organization: "Community Health Initiative",
          warnings: 0,
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "organization",
          status: "active",
          verified: true,
          createdAt: "2023-08-02T11:00:00Z",
          lastLogin: "2023-08-15T14:20:00Z",
          organization: "Local Education Board",
          warnings: 1,
        },
        {
          _id: "3",
          name: "Bob Wilson",
          email: "bob@example.com",
          role: "representative",
          status: "suspended",
          verified: false,
          createdAt: "2023-08-03T09:00:00Z",
          lastLogin: "2023-08-14T16:45:00Z",
          organization: "Youth Development Center",
          warnings: 2,
        },
      ]);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching users");
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    try {
      // TODO: Implement API call for user action
      // await performUserAction(userId, action);

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? {
                ...user,
                status:
                  action === "suspend"
                    ? "suspended"
                    : action === "activate"
                    ? "active"
                    : user.status,
                warnings: action === "warn" ? user.warnings + 1 : user.warnings,
              }
            : user
        )
      );

      const actionMessages = {
        suspend: "User has been suspended",
        activate: "User has been activated",
        warn: "Warning has been issued to user",
        reset: "User password has been reset",
      };

      toast.success(actionMessages[action] || "Action completed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error performing action");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading users
            </h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="ml-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FilterIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="organization">Organizations</option>
              <option value="representative">Representatives</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filters.verified}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, verified: e.target.value }))
              }
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Active
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.organization && (
                        <div className="text-xs text-gray-500">
                          {user.organization}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.verified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-yellow-600">Unverified</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                  {user.warnings > 0 && (
                    <span className="ml-2 text-xs text-yellow-600">
                      {user.warnings} warning(s)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {user.status === "active" ? (
                      <button
                        onClick={() => handleAction(user._id, "suspend")}
                        className="text-red-600 hover:text-red-900"
                      >
                        <BanIcon className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(user._id, "activate")}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(user._id, "warn")}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <ExclamationCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleAction(user._id, "reset")}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <KeyIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
