import React, { useState, useEffect, useContext } from "react";
import { ToastContext } from "../../contexts/ToastContext";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
      } else {
        showToast(data.message || "Failed to fetch preferences", "error");
      }
    } catch (error) {
      showToast("Error fetching preferences", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (type, field, value) => {
    try {
      const updatedPreferences = {
        preferences: {
          [type]: {
            [field]: value,
          },
        },
      };

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedPreferences),
      });

      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
        showToast("Preferences updated successfully", "success");
      } else {
        showToast(data.message || "Failed to update preferences", "error");
      }
    } catch (error) {
      showToast("Error updating preferences", "error");
    }
  };

  const handleDigestChange = async (field, value) => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          emailDigest: {
            [field]: value,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
        showToast("Email digest settings updated", "success");
      } else {
        showToast(data.message || "Failed to update email digest", "error");
      }
    } catch (error) {
      showToast("Error updating email digest", "error");
    }
  };

  const handleDoNotDisturbChange = async (field, value) => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          doNotDisturb: {
            [field]: value,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreferences(data.preferences);
        showToast("Do not disturb settings updated", "success");
      } else {
        showToast(data.message || "Failed to update do not disturb", "error");
      }
    } catch (error) {
      showToast("Error updating do not disturb", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Notification Preferences</h2>
      </div>
      <div className="p-4 space-y-6">
        {/* Notification Types */}
        <div>
          <h3 className="text-md font-medium mb-4">Notification Types</h3>
          <div className="space-y-4">
            {Object.entries(preferences?.preferences || {}).map(
              ([type, settings]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">
                      {type.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            type,
                            "enabled",
                            e.target.checked
                          )
                        }
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Enabled</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.email}
                        onChange={(e) =>
                          handlePreferenceChange(
                            type,
                            "email",
                            e.target.checked
                          )
                        }
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.push}
                        onChange={(e) =>
                          handlePreferenceChange(type, "push", e.target.checked)
                        }
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Push</span>
                    </label>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Email Digest */}
        <div>
          <h3 className="text-md font-medium mb-4">Email Digest</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences?.emailDigest.enabled}
                onChange={(e) =>
                  handleDigestChange("enabled", e.target.checked)
                }
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Enable Email Digest</span>
            </label>
            <select
              value={preferences?.emailDigest.frequency}
              onChange={(e) => handleDigestChange("frequency", e.target.value)}
              disabled={!preferences?.emailDigest.enabled}
              className="form-select rounded-md border-gray-300"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        {/* Do Not Disturb */}
        <div>
          <h3 className="text-md font-medium mb-4">Do Not Disturb</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences?.doNotDisturb.enabled}
                onChange={(e) =>
                  handleDoNotDisturbChange("enabled", e.target.checked)
                }
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2">Enable Do Not Disturb</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={preferences?.doNotDisturb.startTime}
                onChange={(e) =>
                  handleDoNotDisturbChange("startTime", e.target.value)
                }
                disabled={!preferences?.doNotDisturb.enabled}
                className="form-input rounded-md border-gray-300"
              />
              <span>to</span>
              <input
                type="time"
                value={preferences?.doNotDisturb.endTime}
                onChange={(e) =>
                  handleDoNotDisturbChange("endTime", e.target.value)
                }
                disabled={!preferences?.doNotDisturb.enabled}
                className="form-input rounded-md border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
