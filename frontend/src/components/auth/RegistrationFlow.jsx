import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const RegistrationFlow = () => {
  const { type = "citizen" } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Common fields
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: {
      county: "",
      constituency: "",
      ward: "",
    },
    // Role-specific fields
    role: type,
    // Organization fields
    organizationName: "",
    registrationNumber: "",
    organizationType: "",
    description: "",
    certificate: null,
    // Representative fields
    title: "",
    bio: "",
    organizationId: "",
    idCard: null,
    credentials: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Email is invalid";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8)
          newErrors.password = "Password must be at least 8 characters";
        if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
        break;

      case 2:
        if (!formData.phone) newErrors.phone = "Phone number is required";
        if (!formData.location.county)
          newErrors["location.county"] = "County is required";
        if (!formData.location.constituency)
          newErrors["location.constituency"] = "Constituency is required";
        if (!formData.location.ward)
          newErrors["location.ward"] = "Ward is required";
        break;

      case 3:
        if (type === "organization") {
          if (!formData.organizationName)
            newErrors.organizationName = "Organization name is required";
          if (!formData.registrationNumber)
            newErrors.registrationNumber = "Registration number is required";
          if (!formData.organizationType)
            newErrors.organizationType = "Organization type is required";
          if (!formData.description)
            newErrors.description = "Description is required";
          if (!formData.certificate)
            newErrors.certificate = "Registration certificate is required";
        } else if (type === "representative") {
          if (!formData.title) newErrors.title = "Title is required";
          if (!formData.bio) newErrors.bio = "Bio is required";
          if (!formData.organizationId)
            newErrors.organizationId = "Organization is required";
          if (!formData.idCard) newErrors.idCard = "ID card is required";
          if (!formData.credentials)
            newErrors.credentials = "Credentials are required";
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (typeof value === "object" && value !== null) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      await register(formDataToSend);
      navigate("/verification-pending");
    } catch (error) {
      setErrors({
        submit: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                }`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                }`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  errors.phone
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                }`}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div>
                <select
                  name="location.county"
                  value={formData.location.county}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors["location.county"]
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                >
                  <option value="">Select County</option>
                  {/* Add county options */}
                </select>
                {errors["location.county"] && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors["location.county"]}
                  </p>
                )}
              </div>

              <div>
                <select
                  name="location.constituency"
                  value={formData.location.constituency}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors["location.constituency"]
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                >
                  <option value="">Select Constituency</option>
                  {/* Add constituency options */}
                </select>
                {errors["location.constituency"] && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors["location.constituency"]}
                  </p>
                )}
              </div>

              <div>
                <select
                  name="location.ward"
                  value={formData.location.ward}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors["location.ward"]
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                >
                  <option value="">Select Ward</option>
                  {/* Add ward options */}
                </select>
                {errors["location.ward"] && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors["location.ward"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        if (type === "organization") {
          return (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="organizationName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.organizationName
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                />
                {errors.organizationName && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.organizationName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="registrationNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Registration Number
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.registrationNumber
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                />
                {errors.registrationNumber && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.registrationNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="organizationType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization Type
                </label>
                <select
                  id="organizationType"
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.organizationType
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="NGO">NGO</option>
                  <option value="CBO">CBO</option>
                  <option value="Faith Based">Faith Based</option>
                  <option value="Government Agency">Government Agency</option>
                  <option value="Private Company">Private Company</option>
                  <option value="Other">Other</option>
                </select>
                {errors.organizationType && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.organizationType}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.description
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="certificate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Registration Certificate
                </label>
                <input
                  type="file"
                  id="certificate"
                  name="certificate"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
                    errors.certificate
                      ? "file:bg-red-50 file:text-red-700"
                      : "file:bg-primary-50 file:text-primary-700"
                  }`}
                />
                {errors.certificate && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.certificate}
                  </p>
                )}
              </div>
            </div>
          );
        } else if (type === "representative") {
          return (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.title
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.bio
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                />
                {errors.bio && (
                  <p className="mt-2 text-sm text-red-600">{errors.bio}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="organizationId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization
                </label>
                <select
                  id="organizationId"
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.organizationId
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                  }`}
                >
                  <option value="">Select Organization</option>
                  {/* Add organization options */}
                </select>
                {errors.organizationId && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.organizationId}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="idCard"
                  className="block text-sm font-medium text-gray-700"
                >
                  ID Card
                </label>
                <input
                  type="file"
                  id="idCard"
                  name="idCard"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
                    errors.idCard
                      ? "file:bg-red-50 file:text-red-700"
                      : "file:bg-primary-50 file:text-primary-700"
                  }`}
                />
                {errors.idCard && (
                  <p className="mt-2 text-sm text-red-600">{errors.idCard}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="credentials"
                  className="block text-sm font-medium text-gray-700"
                >
                  Credentials
                </label>
                <input
                  type="file"
                  id="credentials"
                  name="credentials"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleInputChange}
                  className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
                    errors.credentials
                      ? "file:bg-red-50 file:text-red-700"
                      : "file:bg-primary-50 file:text-primary-700"
                  }`}
                />
                {errors.credentials && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.credentials}
                  </p>
                )}
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {type === "organization"
            ? "Register Organization"
            : type === "representative"
            ? "Register as Representative"
            : "Create Account"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex items-center ${
                    stepNumber < 3 ? "w-full" : ""
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step >= stepNumber
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        step > stepNumber ? "bg-primary-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Account</span>
              <span className="text-xs text-gray-500">Location</span>
              <span className="text-xs text-gray-500">Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {errors.submit && (
              <div className="mt-4 text-sm text-red-600">{errors.submit}</div>
            )}

            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;
