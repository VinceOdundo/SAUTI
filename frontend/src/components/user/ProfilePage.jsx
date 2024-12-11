import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfile } from "../../redux/slices/userSlice";
import { useToast } from "../../contexts/ToastContext";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    constituency: "",
    bio: "",
    phoneNumber: "",
    county: "",
    ward: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        constituency: user.constituency || "",
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
        county: user.county || "",
        ward: user.ward || "",
      });
      if (user.avatar) {
        setPreviewUrl(user.avatar);
      }
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        showToast("Only JPEG, JPG and PNG files are allowed", "error");
        return;
      }
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      }
      await dispatch(updateProfile(formDataToSend)).unwrap();
      showToast("Profile updated successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  if (loading) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={previewUrl || "/default-avatar.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label
              htmlFor="avatar"
              className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="font-medium">Profile Photo</h3>
            <p className="text-sm text-gray-500">JPG, PNG. Max 5MB.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-field w-full"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="input-field w-full"
              required
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              className="input-field w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="county" className="block text-sm font-medium mb-1">
              County
            </label>
            <input
              type="text"
              id="county"
              value={formData.county}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, county: e.target.value }))
              }
              className="input-field w-full"
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="constituency"
              className="block text-sm font-medium mb-1"
            >
              Constituency
            </label>
            <input
              type="text"
              id="constituency"
              value={formData.constituency}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  constituency: e.target.value,
                }))
              }
              className="input-field w-full"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ward" className="block text-sm font-medium mb-1">
              Ward
            </label>
            <input
              type="text"
              id="ward"
              value={formData.ward}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, ward: e.target.value }))
              }
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="form-group col-span-full">
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            rows="4"
            className="input-field w-full"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => dispatch(getProfile())}
            className="btn-secondary"
            disabled={loading}
          >
            Reset
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
