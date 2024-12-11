import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  getReportedContent,
  moderateContent,
  trackAnalytics,
} from "../../features/admin/adminAPI";
import { toast } from "react-hot-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  BanIcon,
  FilterIcon,
  RefreshIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";
import { format } from "date-fns";

const ContentModeration = () => {
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all", // all, posts, comments
    status: "pending", // pending, resolved, dismissed
    severity: "all", // all, low, medium, high
    dateRange: "all", // all, today, week, month
  });

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReportedContent(filters);
      setContent(data);
      trackAnalytics({
        type: "moderation_content_view",
        contentType: "system",
        userId: user._id,
        metadata: {
          filters,
          contentCount: data.length,
        },
      });
    } catch (error) {
      console.error("Error fetching reported content:", error);
      toast.error("Failed to load reported content");
    } finally {
      setLoading(false);
    }
  }, [filters, user._id]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    trackAnalytics({
      type: "moderation_filter_change",
      contentType: "system",
      userId: user._id,
      metadata: {
        filterKey: key,
        oldValue: filters[key],
        newValue: value,
      },
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.size === 0) {
      toast.error("Please select items to moderate");
      return;
    }

    try {
      setLoading(true);
      const itemIds = Array.from(selectedItems);
      await Promise.all(
        itemIds.map((id) =>
          moderateContent(id, {
            action,
            moderatorId: user._id,
            notes: `Bulk ${action} action`,
          })
        )
      );

      trackAnalytics({
        type: "moderation_bulk_action",
        contentType: "system",
        userId: user._id,
        metadata: {
          action,
          itemCount: itemIds.length,
        },
      });

      toast.success(`${itemIds.length} items ${action} successfully`);
      setSelectedItems(new Set());
      fetchContent();
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Failed to perform bulk action");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleAction = async (id, action) => {
    try {
      setLoading(true);
      await moderateContent(id, {
        action,
        moderatorId: user._id,
      });

      trackAnalytics({
        type: "moderation_single_action",
        contentId: id,
        contentType: "moderation",
        userId: user._id,
        metadata: {
          action,
        },
      });

      toast.success(`Content ${action} successfully`);
      fetchContent();
    } catch (error) {
      console.error("Moderation error:", error);
      toast.error("Failed to moderate content");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === content.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(content.map((item) => item._id)));
    }
  };

  const renderContentItem = (item) => {
    const isSelected = selectedItems.has(item._id);

    return (
      <div
        key={item._id}
        className={`p-4 border rounded-lg ${
          isSelected
            ? "bg-info-bg border-accent-primary"
            : "bg-bg-primary border-border"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelectItem(item._id)}
              className="h-4 w-4 text-accent-primary rounded border-border focus:ring-accent-primary"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-text-primary">
                  {item.author.name}
                </span>
                <span className="text-sm text-text-secondary">
                  {format(new Date(item.createdAt), "PPp")}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.severity === "high"
                      ? "bg-error-bg text-error-text"
                      : item.severity === "medium"
                      ? "bg-warning-bg text-warning-text"
                      : "bg-success-bg text-success-text"
                  }`}
                >
                  {item.severity}
                </span>
              </div>
              <p className="mt-1 text-text-secondary">{item.content}</p>
              <div className="mt-2 text-sm text-text-secondary">
                <span className="font-medium">Reported by:</span>{" "}
                {item.reports.length} users
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleSingleAction(item._id, "approve")}
              className="p-1 rounded-full text-success-text hover:bg-success-bg"
              title="Approve"
            >
              <CheckCircleIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSingleAction(item._id, "reject")}
              className="p-1 rounded-full text-error-text hover:bg-error-bg"
              title="Reject"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSingleAction(item._id, "ban")}
              className="p-1 rounded-full text-text-secondary hover:bg-hover-bg"
              title="Ban User"
            >
              <BanIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">
          Content Moderation
        </h2>
        <button
          onClick={fetchContent}
          className="flex items-center space-x-2 text-text-secondary hover:text-text-primary"
        >
          <RefreshIcon className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-bg-primary p-4 rounded-lg shadow-sm">
        <FilterIcon className="h-5 w-5 text-text-secondary" />
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          className="rounded-md border-border text-sm focus:ring-accent-primary focus:border-accent-primary bg-bg-primary text-text-primary"
        >
          <option value="all">All Content</option>
          <option value="posts">Posts Only</option>
          <option value="comments">Comments Only</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="rounded-md border-border text-sm focus:ring-accent-primary focus:border-accent-primary bg-bg-primary text-text-primary"
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>

        <select
          value={filters.severity}
          onChange={(e) => handleFilterChange("severity", e.target.value)}
          className="rounded-md border-border text-sm focus:ring-accent-primary focus:border-accent-primary bg-bg-primary text-text-primary"
        >
          <option value="all">All Severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange("dateRange", e.target.value)}
          className="rounded-md border-border text-sm focus:ring-accent-primary focus:border-accent-primary bg-bg-primary text-text-primary"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between bg-bg-secondary p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedItems.size === content.length}
              onChange={selectAll}
              className="h-4 w-4 text-accent-primary rounded border-border focus:ring-accent-primary"
            />
            <span className="text-sm text-text-secondary">
              {selectedItems.size} items selected
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleBulkAction("approve")}
              className="px-4 py-2 text-sm font-medium text-success-text bg-success-bg rounded-md hover:bg-success-bg/80"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkAction("reject")}
              className="px-4 py-2 text-sm font-medium text-error-text bg-error-bg rounded-md hover:bg-error-bg/80"
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : content.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ExclamationCircleIcon className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2">No reported content found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {content.map((item) => renderContentItem(item))}
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
