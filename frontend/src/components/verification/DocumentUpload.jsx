import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  DocumentAddIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";
import { submitVerification } from "../../features/verification/verificationAPI";

const DocumentUpload = () => {
  const { user } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState("id");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must not exceed 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/heic",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(
        "Invalid file type. Please upload an image, PDF, or document"
      );
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !documentType) {
      toast.error("Please select a document and type");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", documentType);

      await submitVerification(formData);
      toast.success("Document submitted successfully");
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  if (user.verificationStatus === "pending") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mr-2" />
          <p className="text-sm text-yellow-700">
            Your verification request is pending review. We'll notify you once
            it's processed.
          </p>
        </div>
      </div>
    );
  }

  if (user.verificationStatus === "approved") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-sm text-green-700">
            Your account is verified. You have access to all features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Submit Verification Document
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="id">National ID</option>
            <option value="business_license">Business License</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Document
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Document preview"
                    className="mx-auto h-48 w-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1 text-red-600 hover:text-red-700"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <DocumentAddIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, HEIC, PDF up to 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading || !file}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Submit Document"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;
