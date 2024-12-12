import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  TrashIcon,
  BanIcon,
  XIcon,
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
          className="block w-48 pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm rounded-md bg-base text-primary"
        >
          <option value="all">All Content</option>
          <option value="post">Posts</option>
          <option value="user">Users</option>
          <option value="comment">Comments</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="block w-48 pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm rounded-md bg-base text-primary"
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="ignored">Ignored</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="bg-base shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-border">
          {reports.map((report) => (
            <li key={report._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-primary font-medium">
                      {report.reporter.name}
                    </span>
                    <span className="text-secondary">
                      reported {report.type}
                    </span>
                  </div>
                  <p className="mt-1 text-secondary">{report.reason}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAction(report._id, "ignore")}
                    className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-secondary bg-base-secondary hover:bg-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Ignore
                  </button>

                  <button
                    onClick={() => handleAction(report._id, "warning")}
                    className="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md text-warning-text bg-warning-bg hover:bg-warning-bg/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-text"
                  >
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    Warn
                  </button>

                  <button
                    onClick={() => handleAction(report._id, "removed")}
                    className="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md text-error-text bg-error-bg hover:bg-error-bg/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-text"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Remove
                  </button>

                  {report.type === "user" && (
                    <button
                      onClick={() => handleAction(report._id, "banned")}
                      className="inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md text-primary bg-bg-tertiary hover:bg-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-primary"
                    >
                      <BanIcon className="h-4 w-4 mr-1" />
                      Ban
                    </button>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mt-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === "pending"
                      ? "bg-warning-bg text-warning-text"
                      : report.status === "resolved"
                      ? "bg-success-bg text-success-text"
                      : "bg-base-secondary text-secondary"
                  }`}
                >
                  {report.status.charAt(0).toUpperCase() +
                    report.status.slice(1)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportedContent;
