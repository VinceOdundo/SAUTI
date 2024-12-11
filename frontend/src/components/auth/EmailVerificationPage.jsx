import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContext } from "../../contexts/ToastContext";

const EmailVerificationPage = () => {
  const [status, setStatus] = useState("verifying");
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          showToast("Email verified successfully", "success");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          showToast(data.message || "Verification failed", "error");
        }
      } catch (error) {
        setStatus("error");
        showToast("An error occurred during verification", "error");
      }
    };

    verifyEmail();
  }, [token, navigate, showToast]);

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg">Verifying your email...</p>
          </div>
        );
      case "success":
        return (
          <div className="text-center text-green-600">
            <svg
              className="h-16 w-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold">Email Verified!</h3>
            <p className="mt-2">
              Your email has been verified successfully. Redirecting to login...
            </p>
          </div>
        );
      case "error":
        return (
          <div className="text-center text-red-600">
            <svg
              className="h-16 w-16 mx-auto text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold">Verification Failed</h3>
            <p className="mt-2">
              Unable to verify your email. The link may be invalid or expired.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Return to Login
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
