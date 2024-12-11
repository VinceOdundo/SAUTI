import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const VerificationPending = () => {
  const { user } = useAuth();

  const getVerificationMessage = () => {
    if (!user) {
      return {
        title: "Registration Complete",
        message:
          "Your account has been created successfully. Please check your email to verify your account.",
      };
    }

    switch (user.role) {
      case "organization":
        return {
          title: "Organization Verification Pending",
          message:
            "Your organization registration is being reviewed by our team. This usually takes 1-2 business days. You'll receive an email once your organization is verified.",
        };
      case "representative":
        return {
          title: "Representative Verification Pending",
          message:
            "Your representative account is being reviewed by our team. This usually takes 1-2 business days. You'll receive an email once your account is verified.",
        };
      default:
        return {
          title: "Email Verification Required",
          message:
            "Please check your email to verify your account. If you haven't received the verification email, you can request a new one below.",
        };
    }
  };

  const { title, message } = getVerificationMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
          <svg
            className="h-6 w-6 text-yellow-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">{message}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {!user && (
              <div>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign In
                </Link>
              </div>
            )}

            <div>
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Resend Verification Email
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                to="/support"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Need help? Contact Support
              </Link>
            </div>

            {user && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500">
                  <p>While you wait, you can:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Complete your profile information</li>
                    <li>Browse the community forum</li>
                    <li>Read our community guidelines</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
