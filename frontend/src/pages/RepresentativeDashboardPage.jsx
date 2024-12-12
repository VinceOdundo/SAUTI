import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getRepresentative,
  getRepresentativeStats,
} from "../features/representative/representativeAPI";
import { toast } from "react-hot-toast";

const RepresentativeDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { representative, loading, error, stats } = useSelector(
    (state) => state.representative
  );
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?._id) {
      dispatch(getRepresentative(user._id));
      dispatch(getRepresentativeStats());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!representative) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">No representative found</div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Constituents</h3>
          <p className="text-3xl font-bold text-primary-600">
            {stats?.constituentsCount || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total constituents</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Response Rate</h3>
          <p className="text-3xl font-bold text-primary-600">
            {stats?.messageResponseRate?.toFixed(1) || 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Message response rate</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Forum Activity</h3>
          <p className="text-3xl font-bold text-primary-600">
            {stats?.forumParticipation || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">Posts in last 30 days</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Representative Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Position</p>
            <p className="font-medium">{representative.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Political Party</p>
            <p className="font-medium">{representative.party}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">County</p>
            <p className="font-medium">{representative.county}</p>
          </div>
          {representative.constituency && (
            <div>
              <p className="text-sm text-gray-600">Constituency</p>
              <p className="font-medium">{representative.constituency}</p>
            </div>
          )}
          {representative.ward && (
            <div>
              <p className="text-sm text-gray-600">Ward</p>
              <p className="font-medium">{representative.ward}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Office Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{representative.officeContact.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{representative.officeContact.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">
              {representative.officeContact.address}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Term Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="font-medium">
              {new Date(representative.term.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">End Date</p>
            <p className="font-medium">
              {new Date(representative.term.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Verification Documents</h3>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">ID Card</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-gray-600">ID Card</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={representative.verificationDocuments.idCard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-900 text-sm"
              >
                View
              </a>
              <button
                onClick={() => {
                  /* TODO: Implement update */
                }}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Update
              </button>
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                representative.verificationDocuments.idCard.verified
                  ? "status-success"
                  : "status-warning"
              }`}
            >
              {representative.verificationDocuments.idCard.verified
                ? "Verified"
                : "Pending Verification"}
            </span>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Certificate of Election</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm text-gray-600">Certificate</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={representative.verificationDocuments.certificate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-900 text-sm"
              >
                View
              </a>
              <button
                onClick={() => {
                  /* TODO: Implement update */
                }}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Update
              </button>
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                representative.verificationDocuments.certificate.verified
                  ? "status-success"
                  : "status-warning"
              }`}
            >
              {representative.verificationDocuments.certificate.verified
                ? "Verified"
                : "Pending Verification"}
            </span>
          </div>
        </div>

        {representative.verificationDocuments.additionalDocs.map(
          (doc, index) => (
            <div key={index} className="card">
              <h4 className="font-medium mb-2">{doc.name}</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-secondary">{doc.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-primary hover:text-accent-secondary text-sm transition-base"
                  >
                    View
                  </a>
                  <button
                    onClick={() => {
                      /* TODO: Implement delete */
                    }}
                    className="text-error-text hover:text-error-text/80 text-sm transition-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        <div className="mt-4">
          <button
            onClick={() => {
              /* TODO: Implement upload */
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Upload Additional Document
          </button>
        </div>
      </div>
    </div>
  );

  const renderFollowers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Followers</h3>
          <div className="text-sm text-gray-500">
            {representative.followers.length} followers
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {representative.followers.map((follower) => (
            <div
              key={follower._id}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200">
                {/* TODO: Add avatar */}
              </div>
              <div>
                <p className="font-medium text-gray-900">{follower.name}</p>
                <p className="text-sm text-gray-500">{follower.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Following</h3>
          <div className="text-sm text-gray-500">
            {representative.following.length} following
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {representative.following.map((following) => (
            <div
              key={following._id}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <div className="h-10 w-10 rounded-full bg-gray-200">
                {/* TODO: Add avatar */}
              </div>
              <div>
                <p className="font-medium text-gray-900">{following.name}</p>
                <p className="text-sm text-gray-500">{following.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {representative.user.name}
            </h1>
            <p className="text-gray-500">
              {representative.position} - {representative.party}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                representative.verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {representative.verified ? "Verified" : "Pending Verification"}
            </span>
            <button
              onClick={() => {
                /* TODO: Implement edit */
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="mb-8">
          <nav className="flex space-x-4">
            {["overview", "documents", "followers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "documents" && renderDocuments()}
          {activeTab === "followers" && renderFollowers()}
        </div>
      </div>
    </div>
  );
};

export default RepresentativeDashboardPage;
