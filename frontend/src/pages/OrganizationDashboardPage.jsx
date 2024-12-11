import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOrganization } from "../features/organization/organizationAPI";
import { toast } from "react-hot-toast";

const OrganizationDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organization, loading, error } = useSelector(
    (state) => state.organization
  );
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user?.organizationId) {
      dispatch(getOrganization(user.organizationId));
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-secondary flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-secondary flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-base-secondary flex items-center justify-center">
        <div className="text-xl text-gray-600">No organization found</div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-base rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Organization Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{organization.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-medium">{organization.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Registration Number</p>
            <p className="font-medium">{organization.registrationNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium capitalize">{organization.status}</p>
          </div>
        </div>
      </div>

      <div className="bg-base rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{organization.contact.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{organization.contact.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium">
              {organization.contact.address.street},{" "}
              {organization.contact.address.city}
              <br />
              {organization.contact.address.county},{" "}
              {organization.contact.address.postalCode}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-base rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Areas of Operation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {organization.areas.map((area, index) => (
            <div key={index} className="bg-gray-50 rounded p-3">
              <p className="font-medium">{area.county}</p>
              {area.constituency && (
                <p className="text-sm text-gray-600">{area.constituency}</p>
              )}
              {area.ward && (
                <p className="text-sm text-gray-600">{area.ward}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-base rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
        <div className="flex flex-wrap gap-2">
          {organization.focus.map((area, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRepresentatives = () => (
    <div className="bg-base rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Representatives</h3>
          <button
            onClick={() => {
              /* TODO: Implement add representative */
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Representative
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organization.representatives.map((rep) => (
                <tr key={rep.user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200">
                        {/* TODO: Add avatar */}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {rep.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rep.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {rep.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rep.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        /* TODO: Implement edit */
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        /* TODO: Implement remove */
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="bg-base rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Documents</h3>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Registration Certificate</h4>
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
              <span className="text-sm text-gray-600">Certificate.pdf</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={organization.verificationDocuments.certificate.url}
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
                organization.verificationDocuments.certificate.verified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {organization.verificationDocuments.certificate.verified
                ? "Verified"
                : "Pending Verification"}
            </span>
          </div>
        </div>

        {organization.verificationDocuments.additionalDocs.map((doc, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">{doc.name}</h4>
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
                <span className="text-sm text-gray-600">{doc.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-900 text-sm"
                >
                  View
                </a>
                <button
                  onClick={() => {
                    /* TODO: Implement delete */
                  }}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

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

  return (
    <div className="min-h-screen bg-base-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">
            {organization.name}
          </h1>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                organization.verified ? "status-success" : "status-warning"
              }`}
            >
              {organization.verified ? "Verified" : "Pending Verification"}
            </span>
            <button
              onClick={() => {
                /* TODO: Implement edit */
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit Organization
            </button>
          </div>
        </div>

        <div className="mb-8">
          <nav className="flex space-x-4">
            {["overview", "representatives", "documents"].map((tab) => (
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
          {activeTab === "representatives" && renderRepresentatives()}
          {activeTab === "documents" && renderDocuments()}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboardPage;
