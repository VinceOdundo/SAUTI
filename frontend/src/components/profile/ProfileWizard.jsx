import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContext } from "../../contexts/ToastContext";

const steps = [
  {
    id: "personal",
    title: "Personal Information",
    fields: ["name", "phoneNumber", "bio"],
  },
  {
    id: "location",
    title: "Location Details",
    fields: ["county", "constituency", "ward"],
  },
];

const ProfileWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    bio: "",
    county: "",
    constituency: "",
    ward: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = () => {
    const currentFields = steps[currentStep].fields;
    const emptyFields = currentFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      showToast(`Please fill in all required fields`, "error");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Profile updated successfully", "success");
        navigate("/dashboard");
      } else {
        showToast(data.message || "Failed to update profile", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium">
          Phone Number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          placeholder="Tell us about yourself"
          rows={3}
        />
      </div>
    </div>
  );

  const renderLocationInfo = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="county" className="block text-sm font-medium">
          County
        </label>
        <input
          id="county"
          type="text"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.county}
          onChange={(e) => handleInputChange("county", e.target.value)}
          placeholder="Enter your county"
        />
      </div>
      <div>
        <label htmlFor="constituency" className="block text-sm font-medium">
          Constituency
        </label>
        <input
          id="constituency"
          type="text"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.constituency}
          onChange={(e) => handleInputChange("constituency", e.target.value)}
          placeholder="Enter your constituency"
        />
      </div>
      <div>
        <label htmlFor="ward" className="block text-sm font-medium">
          Ward
        </label>
        <input
          id="ward"
          type="text"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          value={formData.ward}
          onChange={(e) => handleInputChange("ward", e.target.value)}
          placeholder="Enter your ward"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {currentStep === 0 ? renderPersonalInfo() : renderLocationInfo()}

          <div className="flex justify-between">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="ml-auto px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Saving..." : "Complete Profile"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileWizard;
