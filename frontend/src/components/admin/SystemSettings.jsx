import React, { useState, useEffect } from "react";
import { getSystemHealth } from "../../features/admin/adminAPI";
import LoadingSpinner from "../common/LoadingSpinner";

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    general: {
      siteName: "Sauti",
      siteDescription: "Community Engagement Platform",
      maintenanceMode: false,
      allowRegistration: true,
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      passwordMinLength: 8,
      requireEmailVerification: true,
      requirePhoneVerification: true,
    },
    content: {
      maxPostLength: 5000,
      maxCommentLength: 1000,
      allowedFileTypes: ["image/jpeg", "image/png", "application/pdf"],
      maxFileSize: 5, // in MB
      moderationEnabled: true,
      autoModeration: true,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
      digestFrequency: "daily",
    },
  });
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const healthData = await getSystemHealth();
        setSystemHealth(healthData);
      } catch (err) {
        setError(err.message || "Failed to fetch system health");
      } finally {
        setLoading(false);
      }
    };

    fetchSystemHealth();
  }, []);

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to save settings
      // await saveSystemSettings(settings);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to save settings");
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  const tabs = [
    { id: "general", name: "General" },
    { id: "security", name: "Security" },
    { id: "content", name: "Content" },
    { id: "notifications", name: "Notifications" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              System Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Configure platform settings and features
            </p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Server Status
              </h3>
              <div className="mt-1 flex items-center">
                <span
                  className={`h-3 w-3 rounded-full ${
                    systemHealth.status === "healthy"
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                ></span>
                <span className="ml-2 text-sm text-gray-900 capitalize">
                  {systemHealth.status}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">CPU Usage</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {systemHealth.cpuUsage}%
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Memory Usage
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {systemHealth.memoryUsage}%
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Response Time
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {systemHealth.responseTime}ms
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-8 font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) =>
                    handleSettingChange("general", "siteName", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "siteDescription",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "maintenanceMode",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="maintenanceMode"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Maintenance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowRegistration"
                  checked={settings.general.allowRegistration}
                  onChange={(e) =>
                    handleSettingChange(
                      "general",
                      "allowRegistration",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="allowRegistration"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Allow New Registrations
                </label>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "maxLoginAttempts",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "lockoutDuration",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "passwordMinLength",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  checked={settings.security.requireEmailVerification}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "requireEmailVerification",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="requireEmailVerification"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Require Email Verification
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requirePhoneVerification"
                  checked={settings.security.requirePhoneVerification}
                  onChange={(e) =>
                    handleSettingChange(
                      "security",
                      "requirePhoneVerification",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="requirePhoneVerification"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Require Phone Verification
                </label>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Post Length (characters)
                </label>
                <input
                  type="number"
                  value={settings.content.maxPostLength}
                  onChange={(e) =>
                    handleSettingChange(
                      "content",
                      "maxPostLength",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Comment Length (characters)
                </label>
                <input
                  type="number"
                  value={settings.content.maxCommentLength}
                  onChange={(e) =>
                    handleSettingChange(
                      "content",
                      "maxCommentLength",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.content.maxFileSize}
                  onChange={(e) =>
                    handleSettingChange(
                      "content",
                      "maxFileSize",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="moderationEnabled"
                  checked={settings.content.moderationEnabled}
                  onChange={(e) =>
                    handleSettingChange(
                      "content",
                      "moderationEnabled",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="moderationEnabled"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Content Moderation
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoModeration"
                  checked={settings.content.autoModeration}
                  onChange={(e) =>
                    handleSettingChange(
                      "content",
                      "autoModeration",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autoModeration"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Automatic Moderation
                </label>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "emailNotifications",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="emailNotifications"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "smsNotifications",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="smsNotifications"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable SMS Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "pushNotifications",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="pushNotifications"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Push Notifications
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Digest Frequency
                </label>
                <select
                  value={settings.notifications.digestFrequency}
                  onChange={(e) =>
                    handleSettingChange(
                      "notifications",
                      "digestFrequency",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
