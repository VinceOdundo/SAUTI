import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerAsRepresentative } from "../../features/representative/representativeAPI";
import { toast } from "react-toastify";

const RepresentativeRegistrationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.representative);

  const [formData, setFormData] = useState({
    position: "",
    county: "",
    constituency: "",
    ward: "",
  });

  const [credentials, setCredentials] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "image/jpeg" ||
        file.type === "image/png"
    );

    if (validFiles.length !== files.length) {
      toast.error("Please upload only PDF, JPEG, or PNG files");
    }

    setCredentials(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.length === 0) {
      toast.error("Please upload at least one credential document");
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    credentials.forEach((file) => {
      formDataToSend.append("credentials", file);
    });

    try {
      await dispatch(registerAsRepresentative(formDataToSend)).unwrap();
      toast.success("Registration submitted for verification");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Register as Representative
      </h2>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="e.g. Member of County Assembly"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            County
          </label>
          <input
            type="text"
            name="county"
            value={formData.county}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Constituency
          </label>
          <input
            type="text"
            name="constituency"
            value={formData.constituency}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ward
          </label>
          <input
            type="text"
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Credentials (PDF, JPEG, or PNG)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            multiple
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Upload your official documents, certificates, or ID cards that prove
            your position
          </p>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RepresentativeRegistrationForm;
