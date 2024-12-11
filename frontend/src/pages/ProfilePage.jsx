import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Navigation from "../components/Navigation";
import {
  fetchProfile,
  updateProfile,
  updatePassword,
  updateNotificationSettings,
  uploadAvatar,
} from "../store/slices/profileSlice";
import {
  CameraIcon,
  BellIcon,
  KeyIcon,
  UserCircleIcon,
  Cog6ToothIcon as CogIcon,
} from "@heroicons/react/24/outline";

const profileValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  bio: Yup.string().max(500, "Bio must be less than 500 characters"),
  location: Yup.string(),
  phone: Yup.string(),
});

const passwordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const tabs = [
  { name: "Profile", icon: UserCircleIcon },
  { name: "Security", icon: KeyIcon },
  { name: "Notifications", icon: BellIcon },
  { name: "Preferences", icon: CogIcon },
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { profile, notificationSettings, preferences, stats, loading, error } =
    useSelector((state) => state.profile);
  const [activeTab, setActiveTab] = useState("Profile");
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      await dispatch(uploadAvatar(file));
    }
  };

  const handleProfileSubmit = async (values) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handlePasswordSubmit = async (values, { resetForm }) => {
    try {
      await dispatch(updatePassword(values)).unwrap();
      resetForm();
    } catch (error) {
      console.error("Failed to update password:", error);
    }
  };

  const handleNotificationSettingsChange = async (type, setting, value) => {
    try {
      await dispatch(
        updateNotificationSettings({
          ...notificationSettings,
          [type]: {
            ...notificationSettings[type],
            [setting]: value,
          },
        })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update notification settings:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-bg-secondary shadow rounded-lg overflow-hidden">
          <div className="relative h-32 bg-accent-primary">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <img
                  src={
                    avatarPreview ||
                    profile?.avatar ||
                    "/assets/default-avatar.png"
                  }
                  alt={profile?.name}
                  className="w-24 h-24 rounded-full border-4 border-bg-primary"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-bg-primary rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-hover-bg"
                >
                  <CameraIcon className="h-5 w-5 text-text-secondary" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-6 px-8">
            <h1 className="text-2xl font-bold text-text-primary">
              {profile?.name}
            </h1>
            <p className="text-text-secondary">{profile?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats).map(([key, value]) => (
            <div
              key={key}
              className="bg-bg-secondary overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-text-secondary truncate capitalize">
                  {key}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-text-primary">
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-accent-primary focus:border-accent-primary sm:text-sm rounded-md bg-bg-primary text-text-primary"
            >
              {tabs.map((tab) => (
                <option key={tab.name}>{tab.name}</option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`${
                      activeTab === tab.name
                        ? "border-accent-primary text-accent-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
                    } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <tab.icon
                      className={`${
                        activeTab === tab.name
                          ? "text-accent-primary"
                          : "text-text-secondary group-hover:text-text-primary"
                      } -ml-0.5 mr-2 h-5 w-5`}
                    />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "Profile" && (
            <div className="bg-bg-secondary shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <Formik
                  initialValues={{
                    name: profile?.name || "",
                    email: profile?.email || "",
                    bio: profile?.bio || "",
                    location: profile?.location || "",
                    phone: profile?.phone || "",
                  }}
                  validationSchema={profileValidationSchema}
                  onSubmit={handleProfileSubmit}
                >
                  {({ errors, touched }) => (
                    <Form className="space-y-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-text-primary"
                        >
                          Name
                        </label>
                        <Field
                          type="text"
                          name="name"
                          className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-accent-primary focus:border-accent-primary sm:text-sm bg-bg-primary text-text-primary"
                        />
                        {errors.name && touched.name && (
                          <p className="mt-1 text-sm text-error-text">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-text-primary"
                        >
                          Email
                        </label>
                        <Field
                          type="email"
                          name="email"
                          className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-accent-primary focus:border-accent-primary sm:text-sm bg-bg-primary text-text-primary"
                        />
                        {errors.email && touched.email && (
                          <p className="mt-1 text-sm text-error-text">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-text-primary"
                        >
                          Bio
                        </label>
                        <Field
                          as="textarea"
                          name="bio"
                          rows={4}
                          className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-accent-primary focus:border-accent-primary sm:text-sm bg-bg-primary text-text-primary"
                        />
                        {errors.bio && touched.bio && (
                          <p className="mt-1 text-sm text-error-text">
                            {errors.bio}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="location"
                            className="block text-sm font-medium text-text-primary"
                          >
                            Location
                          </label>
                          <Field
                            type="text"
                            name="location"
                            className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-accent-primary focus:border-accent-primary sm:text-sm bg-bg-primary text-text-primary"
                          />
                          {errors.location && touched.location && (
                            <p className="mt-1 text-sm text-error-text">
                              {errors.location}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-text-primary"
                          >
                            Phone
                          </label>
                          <Field
                            type="tel"
                            name="phone"
                            className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-accent-primary focus:border-accent-primary sm:text-sm bg-bg-primary text-text-primary"
                          />
                          {errors.phone && touched.phone && (
                            <p className="mt-1 text-sm text-error-text">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-bg-primary bg-accent-primary hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
                        >
                          Save Changes
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <Formik
                  initialValues={{
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }}
                  validationSchema={passwordValidationSchema}
                  onSubmit={handlePasswordSubmit}
                >
                  {({ errors, touched }) => (
                    <Form className="space-y-6">
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Current Password
                        </label>
                        <Field
                          type="password"
                          name="currentPassword"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {errors.currentPassword && touched.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          New Password
                        </label>
                        <Field
                          type="password"
                          name="newPassword"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {errors.newPassword && touched.newPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.newPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Confirm New Password
                        </label>
                        <Field
                          type="password"
                          name="confirmPassword"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {errors.confirmPassword && touched.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Update Password
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Email Notifications
                    </h3>
                    <div className="mt-4 space-y-4">
                      {Object.entries(notificationSettings.email).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <span className="flex-grow flex flex-col">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {key}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleNotificationSettingsChange(
                                  "email",
                                  key,
                                  !value
                                )
                              }
                              className={`${
                                value ? "bg-primary-600" : "bg-gray-200"
                              } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                            >
                              <span
                                className={`${
                                  value ? "translate-x-5" : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Push Notifications
                    </h3>
                    <div className="mt-4 space-y-4">
                      {Object.entries(notificationSettings.push).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <span className="flex-grow flex flex-col">
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {key}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleNotificationSettingsChange(
                                  "push",
                                  key,
                                  !value
                                )
                              }
                              className={`${
                                value ? "bg-primary-600" : "bg-gray-200"
                              } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                            >
                              <span
                                className={`${
                                  value ? "translate-x-5" : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Preferences" && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Language
                    </label>
                    <select
                      id="language"
                      value={preferences.language}
                      onChange={(e) =>
                        dispatch(
                          updatePreference({
                            key: "language",
                            value: e.target.value,
                          })
                        )
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="theme"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Theme
                    </label>
                    <select
                      id="theme"
                      value={preferences.theme}
                      onChange={(e) =>
                        dispatch(
                          updatePreference({
                            key: "theme",
                            value: e.target.value,
                          })
                        )
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="emailDigest"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Digest
                    </label>
                    <select
                      id="emailDigest"
                      value={preferences.emailDigest}
                      onChange={(e) =>
                        dispatch(
                          updatePreference({
                            key: "emailDigest",
                            value: e.target.value,
                          })
                        )
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
