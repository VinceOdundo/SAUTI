import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  TrashIcon,
  BanIcon,
} from "@heroicons/react/outline";
import { toast } from "react-toastify";

const ReportedContent = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    fetchReports();
  }, [selectedType, selectedStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch reports
      // const { reports } = await getReports({ type: selectedType, status: selectedStatus });
      // setReports(reports);

      // Mock data
      setReports([
        {
          _id: "1",
          type: "post",
          content: {
            title: "Inappropriate Forum Post",
            text: "This post contains inappropriate content...",
            author: "user123",
          },
          reports: [
            {
              reason: "Inappropriate content",
              description: "This post contains offensive language",
              reportedBy: "user456",
              timestamp: "2023-08-15T10:30:00Z",
            },
            {
              reason: "Spam",
              description: "This appears to be a spam post",
              reportedBy: "user789",
              timestamp: "2023-08-15T11:15:00Z",
            },
          ],
          status: "pending",
          createdAt: "2023-08-15T09:00:00Z",
        },
        {
          _id: "2",
          type: "user",
          content: {
            username: "spammer123",
            email: "spammer@example.com",
            reportCount: 5,
          },
          reports: [
            {
              reason: "Spam",
              description: "User is posting spam content",
              reportedBy: "user111",
              timestamp: "2023-08-15T12:30:00Z",
            },
          ],
          status: "pending",
          createdAt: "2023-08-15T08:00:00Z",
        },
      ]);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching reports");
      setLoading(false);
    }
  };

  const handleAction = async (reportId, action) => {
    try {
      // TODO: Implement API call for moderation action
      // await moderateContent(reportId, action);

      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report._id === reportId ? { ...report, status: action } : report
        )
      );

      const actionMessages = {
        ignored: "Report marked as false positive",
        removed: "Content has been removed",
        banned: "User has been banned",
        warning: "Warning has been issued",
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
              Error loading reports
            </h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="all">All Content</option>
          <option value="post">Posts</option>
          <option value="user">Users</option>
          <option value="comment">Comments</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="ignored">Ignored</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {reports.map((report) => (
            <li key={report._id}>
              <div className="px-4 py-4 sm:px-6">
                {/* Report Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {report.type === "post"
                        ? report.content.title
                        : `Reported ${report.type}: ${
                            report.content.username || report.content.author
                          }`}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {report.reports.length} report(s) •{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAction(report._id, "ignored")}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Ignore
                    </button>
                    <button
                      onClick={() => handleAction(report._id, "warning")}
                      className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                      Warn
                    </button>
                    <button
                      onClick={() => handleAction(report._id, "removed")}
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                    {report.type === "user" && (
                      <button
                        onClick={() => handleAction(report._id, "banned")}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <BanIcon className="h-4 w-4 mr-1" />
                        Ban
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                {report.type === "post" && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-900">
                      {report.content.text}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Full Post
                      </button>
                    </div>
                  </div>
                )}

                {/* Reports Details */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                    Report Details
                  </h5>
                  <div className="space-y-3">
                    {report.reports.map((r, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded-md text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {r.reason}
                          </span>
                          <span className="text-gray-500">
                            {new Date(r.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600">{r.description}</p>
                        <div className="mt-1 text-gray-500">
                          Reported by: {r.reportedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : report.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() +
                      report.status.slice(1)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportedContent;
