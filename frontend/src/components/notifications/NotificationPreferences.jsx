import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AppLayout from "../layouts/AppLayout";
import axios from "axios";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    email: {
      posts: true,
      comments: true,
      likes: true,
      follows: true,
      mentions: true,
    },
    push: {
      posts: true,
      comments: true,
      likes: false,
      follows: true,
      mentions: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get("/api/notifications/preferences");
      setPreferences(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch preferences",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (type, category) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: !prev[type][category],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post("/api/notifications/preferences", preferences);
      showToast("Preferences saved successfully", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save preferences",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const PreferenceToggle = ({ label, type, category, enabled }) => (
    <div className="flex items-center justify-between py-4">
      <span className="text-text-primary">{label}</span>
      <button
        onClick={() => handleToggle(type, category)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          enabled ? "bg-accent-primary" : "bg-bg-secondary"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Notification Preferences
            </h1>
            <p className="text-text-secondary mt-1">
              Customize how you want to be notified
            </p>
          </div>
          <Link to="/notifications" className="btn btn-secondary">
            Back to Notifications
          </Link>
        </div>

        {/* Email Preferences */}
        <div className="card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">
              Email Notifications
            </h2>
            <p className="text-text-secondary mt-1">
              Choose which emails you'd like to receive
            </p>
          </div>
          <div className="p-6 space-y-4">
            <PreferenceToggle
              label="New posts from people you follow"
              type="email"
              category="posts"
              enabled={preferences.email.posts}
            />
            <PreferenceToggle
              label="Comments on your posts"
              type="email"
              category="comments"
              enabled={preferences.email.comments}
            />
            <PreferenceToggle
              label="Likes on your posts"
              type="email"
              category="likes"
              enabled={preferences.email.likes}
            />
            <PreferenceToggle
              label="New followers"
              type="email"
              category="follows"
              enabled={preferences.email.follows}
            />
            <PreferenceToggle
              label="Mentions"
              type="email"
              category="mentions"
              enabled={preferences.email.mentions}
            />
          </div>
        </div>

        {/* Push Preferences */}
        <div className="card">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">
              Push Notifications
            </h2>
            <p className="text-text-secondary mt-1">
              Control your mobile and desktop notifications
            </p>
          </div>
          <div className="p-6 space-y-4">
            <PreferenceToggle
              label="New posts from people you follow"
              type="push"
              category="posts"
              enabled={preferences.push.posts}
            />
            <PreferenceToggle
              label="Comments on your posts"
              type="push"
              category="comments"
              enabled={preferences.push.comments}
            />
            <PreferenceToggle
              label="Likes on your posts"
              type="push"
              category="likes"
              enabled={preferences.push.likes}
            />
            <PreferenceToggle
              label="New followers"
              type="push"
              category="follows"
              enabled={preferences.push.follows}
            />
            <PreferenceToggle
              label="Mentions"
              type="push"
              category="mentions"
              enabled={preferences.push.mentions}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`btn btn-primary ${
              isSaving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationPreferences;
