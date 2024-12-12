import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../contexts/ToastContext";
import AppLayout from "../layouts/AppLayout";
import axios from "axios";

const ProfileWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    bio: "",
    interests: [],
    profileImage: null,
    imagePreview: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const interestOptions = [
    "Education",
    "Healthcare",
    "Environment",
    "Economy",
    "Infrastructure",
    "Social Justice",
    "Technology",
    "Security",
    "Foreign Policy",
    "Local Government",
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }
      setFormData({
        ...formData,
        profileImage: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("interests", JSON.stringify(formData.interests));
      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage);
      }

      const response = await axios.post("/api/users/profile", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await updateUser(response.data);
      showToast("Profile updated successfully", "success");
      navigate("/dashboard");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary">
                Basic Information
              </h2>
              <p className="mt-2 text-secondary">
                Let's start with your basic information
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-primary"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="input"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-primary"
                >
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  required
                  className="input"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter your location"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary">
                Profile Picture
              </h2>
              <p className="mt-2 text-secondary">
                Add a profile picture to personalize your account
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={
                    formData.imagePreview ||
                    user?.profileImage ||
                    "/default-avatar.png"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-bg-primary"
                />
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 bg-accent-primary hover:bg-accent-secondary text-white p-2 rounded-full cursor-pointer transition-base"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              <p className="text-sm text-secondary">Maximum file size: 5MB</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-primary">About You</h2>
              <p className="mt-2 text-secondary">Tell us more about yourself</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-primary"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="input resize-none"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Write a short bio about yourself"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-base ${
                        formData.interests.includes(interest)
                          ? "bg-accent-primary text-white"
                          : "bg-base-secondary text-secondary hover:bg-hover-bg"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="container min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          <div className="card space-y-8">
            {/* Progress */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-base ${
                      stepNumber === step
                        ? "bg-accent-primary text-white"
                        : stepNumber < step
                        ? "bg-success-bg text-success-text"
                        : "bg-base-secondary text-secondary"
                    }`}
                  >
                    {stepNumber < step ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between space-x-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-secondary"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (step === 3) {
                    handleSubmit();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={isLoading}
                className={`btn btn-primary ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading
                  ? "Saving..."
                  : step === 3
                  ? "Complete Setup"
                  : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfileWizard;
