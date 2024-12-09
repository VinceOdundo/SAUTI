import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  DocumentIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline";
import { toast } from "react-toastify";

const VerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, [selectedType]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch verification requests
      // const { requests } = await getVerificationRequests(selectedType);
      // setRequests(requests);

      // Mock data
      setRequests([
        {
          _id: "1",
          type: "organization",
          name: "Community Health Initiative",
          registrationNumber: "NGO/2023/001",
          documents: [
            {
              name: "Registration Certificate",
              url: "#",
              verified: false,
            },
            {
              name: "Tax Compliance",
              url: "#",
              verified: true,
            },
          ],
          status: "pending",
          submittedAt: "2023-08-15T10:30:00Z",
        },
        {
          _id: "2",
          type: "representative",
          name: "John Doe",
          organization: "Community Health Initiative",
          position: "Program Director",
          documents: [
            {
              name: "ID Card",
              url: "#",
              verified: false,
            },
            {
              name: "Appointment Letter",
              url: "#",
              verified: false,
            },
          ],
          status: "pending",
          submittedAt: "2023-08-14T15:45:00Z",
        },
      ]);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching requests");
      setLoading(false);
    }
  };

  const handleVerify = async (requestId, verified) => {
    try {
      // TODO: Implement API call to verify/reject request
      // await verifyRequest(requestId, verified);

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? { ...req, status: verified ? "verified" : "rejected" }
            : req
        )
      );

      toast.success(
        `Request ${verified ? "verified" : "rejected"} successfully`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Error ${verified ? "verifying" : "rejecting"} request`
      );
    }
  };

  const handleDocumentVerify = async (requestId, documentName, verified) => {
    try {
      // TODO: Implement API call to verify document
      // await verifyDocument(requestId, documentName, verified);

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? {
                ...req,
                documents: req.documents.map((doc) =>
                  doc.name === documentName ? { ...doc, verified } : doc
                ),
              }
            : req
        )
      );

      toast.success("Document status updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error updating document status"
      );
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
              Error loading verification requests
            </h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter */}
      <div className="mb-6">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="all">All Requests</option>
          <option value="organization">Organizations</option>
          <option value="representative">Representatives</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {requests.map((request) => (
            <li key={request._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {request.name[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {request.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {request.type === "organization"
                          ? `Registration: ${request.registrationNumber}`
                          : `Position: ${request.position} at ${request.organization}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVerify(request._id, true)}
                      disabled={request.status !== "pending"}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(request._id, false)}
                      disabled={request.status !== "pending"}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Documents */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-900">
                    Documents
                  </h5>
                  <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {request.documents.map((doc) => (
                      <div
                        key={doc.name}
                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                      >
                        <div className="flex-shrink-0">
                          <DocumentIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus:outline-none"
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {doc.name}
                            </p>
                            <div className="flex items-center mt-1">
                              <ExternalLinkIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                View Document
                              </span>
                            </div>
                          </a>
                        </div>
                        <div>
                          <button
                            onClick={() =>
                              handleDocumentVerify(
                                request._id,
                                doc.name,
                                !doc.verified
                              )
                            }
                            disabled={request.status !== "pending"}
                            className={`inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white ${
                              doc.verified
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-300 hover:bg-gray-400"
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50`}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status and Timestamp */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Submitted{" "}
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VerificationRequests;
