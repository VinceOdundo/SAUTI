import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerOrganization } from "../../features/organization/organizationAPI";
import LocationPicker from "../post-components/LocationPicker";
import LoadingSpinner from "../common/LoadingSpinner";

const OrganizationRegistrationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    registrationNumber: "",
    description: "",
    contact: {
      email: "",
      phone: "",
      address: "",
    },
    focus: [],
    location: {
      county: "",
      constituency: "",
      ward: "",
    },
    certificate: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      certificate: e.target.files[0],
    }));
  };

  const handleLocationChange = (location) => {
    setFormData((prev) => ({
      ...prev,
      location,
    }));
  };

  const handleFocusChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      focus: checked
        ? [...prev.focus, value]
        : prev.focus.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "contact" || key === "location") {
          data.append(key, JSON.stringify(value));
        } else if (key === "focus") {
          data.append(key, JSON.stringify(value));
        } else if (key === "certificate" && value) {
          data.append("certificate", value);
        } else {
          data.append(key, value);
        }
      });

      await registerOrganization(data);
      navigate("/organization/pending");
    } catch (err) {
      setError(err.message || "Failed to register organization");
    } finally {
      setLoading(false);
    }
  };

  const organizationTypes = [
    "NGO",
    "CBO",
    "Faith Based",
    "Government Agency",
    "Private Company",
    "Other",
  ];

  const focusAreas = [
    "Education",
    "Health",
    "Environment",
    "Human Rights",
    "Economic Empowerment",
    "Youth Development",
    "Women Empowerment",
    "Agriculture",
    "Technology",
    "Other",
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Register Organization</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organization Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Select Type</option>
                {organizationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="contact.address"
                value={formData.contact.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <LocationPicker
            location={formData.location}
            onChange={handleLocationChange}
          />
        </div>

        {/* Focus Areas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Focus Areas</h3>
          <div className="grid grid-cols-2 gap-4">
            {focusAreas.map((area) => (
              <div key={area} className="flex items-center">
                <input
                  type="checkbox"
                  id={area}
                  value={area}
                  checked={formData.focus.includes(area)}
                  onChange={handleFocusChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={area}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {area}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        {/* Certificate Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Registration Certificate
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload your organization's registration certificate (PDF, JPG, PNG)
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
          >
            {loading ? "Registering..." : "Register Organization"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationRegistrationForm;
