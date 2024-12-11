import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getOrganization,
  getOrganizationRepresentatives,
  getOrganizationStats,
} from "../../features/organization/organizationAPI";
import LoadingSpinner from "../common/LoadingSpinner";

const OrganizationProfile = () => {
  const { organizationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [organization, setOrganization] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const [orgData, repsData, statsData] = await Promise.all([
          getOrganization(organizationId),
          getOrganizationRepresentatives(organizationId),
          getOrganizationStats(organizationId),
        ]);

        setOrganization(orgData.organization);
        setRepresentatives(repsData.representatives);
        setStats(statsData);
      } catch (err) {
        setError(err.message || "Failed to fetch organization data");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationData();
  }, [organizationId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!organization) return <div>Organization not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Organization Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organization.name}
            </h1>
            <p className="text-gray-600 mt-2">{organization.type}</p>
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
        <p className="mt-4 text-gray-700">{organization.description}</p>
      </div>

      {/* Organization Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Representatives
            </h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.representativesCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
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
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{organization.contact.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="mt-1">{organization.contact.phone}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500">Address</h3>
            <p className="mt-1">{organization.contact.address}</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">County</h3>
            <p className="mt-1">{organization.location.county}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Constituency</h3>
            <p className="mt-1">{organization.location.constituency}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Ward</h3>
            <p className="mt-1">{organization.location.ward}</p>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Focus Areas
        </h2>
        <div className="flex flex-wrap gap-2">
          {organization.focus.map((area) => (
            <span
              key={area}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Representatives */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Representatives
        </h2>
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
                <div>
                  <h3 className="font-medium text-gray-900">{rep.user.name}</h3>
                  <p className="text-sm text-gray-500">{rep.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfile;
