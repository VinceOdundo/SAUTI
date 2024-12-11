import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import LoadingSpinner from "../common/LoadingSpinner";

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: "public", // public, private
    showLocation: true,
    showEmail: false,
    showPhone: false,
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: "24h", // 1h, 24h, 7d, 30d
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({ settings });
      addToast({
        message: "Settings updated successfully",
        type: "success",
      });
    } catch (error) {
      addToast({
        message: error.message || "Failed to update settings",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 divide-y divide-gray-200"
        >
          {/* Notifications */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Notifications
            </h3>
            <div className="mt-6 space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="emailNotifications"
                    className="font-medium text-gray-700"
                  >
                    Email notifications
                  </label>
                  <p className="text-gray-500">
                    Receive email notifications about your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="pushNotifications"
                    name="pushNotifications"
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="pushNotifications"
                    className="font-medium text-gray-700"
                  >
                    Push notifications
                  </label>
                  <p className="text-gray-500">
                    Receive push notifications about your account.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Privacy
            </h3>
            <div className="mt-6 space-y-6">
              <div>
                <label
                  htmlFor="profileVisibility"
                  className="block text-sm font-medium text-gray-700"
                >
                  Profile Visibility
                </label>
                <select
                  id="profileVisibility"
                  name="profileVisibility"
                  value={settings.profileVisibility}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="showLocation"
                    name="showLocation"
                    type="checkbox"
                    checked={settings.showLocation}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="showLocation"
                    className="font-medium text-gray-700"
                  >
                    Show Location
                  </label>
                  <p className="text-gray-500">
                    Make your location visible to others.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Security
            </h3>
            <div className="mt-6 space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="twoFactorEnabled"
                    name="twoFactorEnabled"
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="twoFactorEnabled"
                    className="font-medium text-gray-700"
                  >
                    Two-Factor Authentication
                  </label>
                  <p className="text-gray-500">
                    Add an extra layer of security to your account.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="sessionTimeout"
                  className="block text-sm font-medium text-gray-700"
                >
                  Session Timeout
                </label>
                <select
                  id="sessionTimeout"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="1h">1 hour</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
