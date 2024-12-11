import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getPendingVerifications,
  reviewVerification,
  getDocument,
} from "../../features/verification/verificationAPI";
import { trackAnalytics } from "../../features/analytics/analyticsAPI";
import { toast } from "react-hot-toast";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDownloadIcon,
  FilterIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import Modal from "../common/Modal";
import { formatDistanceToNow } from "date-fns";

const VerificationRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [filter, setFilter] = useState("pending");
  const [sortBy, setSortBy] = useState("date");
  const [documentUrl, setDocumentUrl] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVerificationRequests();
  }, [filter, page]);

  useEffect(() => {
    // Cleanup document URL when component unmounts
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const response = await getPendingVerifications(filter, page);
      setRequests(response.data);
      setTotalPages(response.pagination.pages);

      trackAnalytics({
        type: "verification_list_view",
        contentType: "system",
        metadata: {
          filter,
          sortBy,
          page,
          requestCount: response.data.length,
        },
      });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentView = async (request) => {
    try {
      setLoading(true);
      const url = await getDocument(request._id);

      // Cleanup previous URL if exists
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }

      setDocumentUrl(url);
      setSelectedRequest(request);
      setViewerOpen(true);

      trackAnalytics({
        type: "verification_document_view",
        contentId: request._id,
        contentType: "verification",
        metadata: {
          documentType: request.document.type,
          submissionAge: Date.now() - new Date(request.createdAt).getTime(),
        },
      });
    } catch (error) {
      console.error("Document view error:", error);
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedRequest(null);
    setReviewNotes("");
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
      setDocumentUrl(null);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setLoading(true);
      await reviewVerification(id, {
        status,
        notes: reviewNotes,
      });

      trackAnalytics({
        type: "verification_review",
        contentId: id,
        contentType: "verification",
        metadata: {
          status,
          notes: reviewNotes,
          timeToReview: selectedRequest
            ? Date.now() - new Date(selectedRequest.createdAt).getTime()
            : 0,
        },
      });

      toast.success(`Request ${status} successfully`);
      handleCloseViewer();
      fetchVerificationRequests();
    } catch (error) {
      console.error("Review error:", error);
      toast.error(`Failed to ${status} request`);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentViewer = () => {
    if (!selectedRequest || !documentUrl) return null;

    const isImage = selectedRequest.document.type.startsWith("image/");

    return (
      <Modal
        isOpen={viewerOpen}
        onClose={handleCloseViewer}
        title="Review Verification Document"
        size="lg"
      >
        <div className="space-y-4">
          {/* Document Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            {isImage ? (
              <img
                src={documentUrl}
                alt="Verification document"
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center p-8">
                <a
                  href={documentUrl}
                  download={selectedRequest.document.key}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  <DocumentDownloadIcon className="w-8 h-8" />
                  <span>Download Document</span>
                </a>
              </div>
            )}
          </div>

          {/* Representative Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700">Representative</h4>
              <p>{selectedRequest.user.name}</p>
              <p className="text-gray-500">{selectedRequest.user.email}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Location</h4>
              <p>{selectedRequest.user.profile?.location.county}</p>
              <p>{selectedRequest.user.profile?.location.constituency}</p>
              <p>{selectedRequest.user.profile?.location.ward}</p>
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700"
            >
              Review Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Add notes about your decision..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleReview(selectedRequest._id, "rejected")}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Reject
            </button>
            <button
              onClick={() => handleReview(selectedRequest._id, "approved")}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Approve
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="location">Location</option>
          </select>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <RefreshIcon className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li
                key={request._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <img
                        src={request.avatar || "/default-avatar.png"}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {request.name}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">
                          {request.county} • {request.constituency}
                        </span>
                        <span className="mx-1">•</span>
                        <span>
                          {formatDistanceToNow(
                            new Date(request.verificationDocument.uploadedAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <button
                      onClick={() => handleDocumentView(request)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      Review
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedRequest && viewerOpen && (
        <Modal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedRequest(null);
            setReviewNotes("");
          }}
          title="Review Verification Document"
        >
          {/* ... existing modal content ... */}
        </Modal>
      )}
    </div>
  );
};

export default VerificationRequests;
