import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import { useSelector } from "react-redux";
import axios from "axios";

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const { user } = useSelector((state) => state.auth); // Get current user from Redux

  // Add isOwnProfile check
  const isOwnProfile = user?._id === userId;

  // Add useEffect to fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/users/${userId}`);
        setProfile(response.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const tabs = [
    { key: "posts", label: "Posts" },
    { key: "following", label: "Following" },
    { key: "followers", label: "Followers" },
    { key: "voted", label: "Voted Posts" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {loading ? (
        <div className="text-center py-8">
          <p className="text-white">Loading profile...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : profile ? (
        <>
          {/* Profile Header */}
          <div className="bg-dark-700 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-6">
              <img
                src={profile?.avatar}
                alt={profile?.name}
                className="w-32 h-32 rounded-full"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  {profile?.name}
                </h1>
                <p className="text-gray-400">{profile?.bio}</p>
                <div className="flex gap-4 mt-4">
                  <span className="text-gray-300">
                    <strong>{profile?.followers.length}</strong> Followers
                  </span>
                  <span className="text-gray-300">
                    <strong>{profile?.following.length}</strong> Following
                  </span>
                </div>
              </div>
              {isOwnProfile && (
                <button className="bg-primary-500 text-white px-4 py-2 rounded-lg">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tab.Group>
            <Tab.List className="flex space-x-1 bg-dark-700 p-1 rounded-lg mb-6">
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }) =>
                    `flex-1 py-2.5 text-sm font-medium leading-5 rounded-lg
                    ${
                      selected
                        ? "bg-primary-500 text-white"
                        : "text-gray-400 hover:bg-dark-600"
                    }`
                  }
                >
                  {tab.label}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>{/* Content for each tab */}</Tab.Panels>
          </Tab.Group>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-white">No profile found</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
