import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getRepresentative,
  getRepresentativeStats,
  getRepresentativeActivities,
  followRepresentative,
  unfollowRepresentative,
} from "../../features/representative/representativeAPI";
import LoadingSpinner from "../common/LoadingSpinner";

const RepresentativeProfile = () => {
  const { representativeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [representative, setRepresentative] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [repData, statsData, activitiesData] = await Promise.all([
          getRepresentative(representativeId),
          getRepresentativeStats(representativeId),
          getRepresentativeActivities(representativeId),
        ]);

        setRepresentative(repData.representative);
        setStats(statsData);
        setActivities(activitiesData.activities);
        setIsFollowing(repData.representative.isFollowedByUser);
      } catch (err) {
        setError(err.message || "Failed to fetch representative data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [representativeId]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowRepresentative(representativeId);
      } else {
        await followRepresentative(representativeId);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      setError(err.message || "Failed to update follow status");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!representative) return <div>Representative not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {representative.user.avatar && (
              <img
                src={representative.user.avatar}
                alt={representative.user.name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {representative.user.name}
              </h1>
              <p className="text-gray-600">{representative.title}</p>
              <p className="text-sm text-gray-500 mt-1">
                {representative.organization.name}
              </p>
            </div>
          </div>
          <button
            onClick={handleFollowToggle}
            className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFollowing
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
                : "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.postsCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900">Followers</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {stats.followersCount}
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

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Bio</h3>
            <p className="mt-1 text-gray-900">{representative.bio}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Focus Areas</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {representative.focusAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-gray-900">
              {representative.location.ward},{" "}
              {representative.location.constituency},{" "}
              {representative.location.county}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activities
        </h2>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-gray-900">{activity.description}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{activity.type}</span>
                    {activity.location && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{activity.location}</span>
                      </>
                    )}
                  </div>
                  {activity.engagement && (
                    <div className="mt-2 text-sm text-gray-500">
                      {activity.engagement.likes} likes •{" "}
                      {activity.engagement.comments} comments
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepresentativeProfile;
