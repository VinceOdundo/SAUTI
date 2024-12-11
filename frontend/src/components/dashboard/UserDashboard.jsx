import React, { useState, useEffect, useContext } from "react";
import { ToastContext } from "../../contexts/ToastContext";
import NotificationList from "../notifications/NotificationList";
import NotificationPreferences from "../notifications/NotificationPreferences";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const { showToast } = useContext(ToastContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
      } else {
        showToast(data.message || "Failed to fetch user data", "error");
      }
    } catch (error) {
      showToast("Error fetching user data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }
      setSelectedImage(file);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        showToast("Profile image updated successfully", "success");
        setUserData((prev) => ({ ...prev, avatar: data.avatar }));
      } else {
        showToast(data.message || "Failed to update profile image", "error");
      }
    } catch (error) {
      showToast("Error uploading image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48 bg-blue-600">
              <div className="absolute -bottom-12 left-8">
                <div className="relative">
                  <img
                    src={userData?.avatar || "/default-avatar.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-16 pb-8 px-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {userData?.name}
              </h1>
              <p className="text-gray-600">{userData?.email}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Location
                  </h2>
                  <div className="mt-2 space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">County:</span>{" "}
                      {userData?.county}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Constituency:</span>{" "}
                      {userData?.constituency}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Ward:</span>{" "}
                      {userData?.ward}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contact
                  </h2>
                  <div className="mt-2 space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Phone:</span>{" "}
                      {userData?.phoneNumber}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Role:</span>{" "}
                      {userData?.role}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Bio</h2>
                <p className="mt-2 text-gray-600">{userData?.bio}</p>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <NotificationList />
            <NotificationPreferences />
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`${
                activeTab === "notifications"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Notifications
            </button>
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default UserDashboard;
