import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post(`/auth/verify-email/${token}`);
        setStatus("success");
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        setStatus("error");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800">
      <div className="max-w-md w-full bg-dark-700 p-8 rounded-lg shadow-lg">
        {status === "verifying" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Verifying Email
            </h2>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500 mx-auto"></div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Email Verified!
            </h2>
            <p className="text-gray-300 mb-4">
              Your email has been verified successfully. You will be redirected
              shortly...
            </p>
            <div className="text-primary-500">
              <svg
                className="h-12 w-12 mx-auto"
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
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-300 mb-4">
              We couldn't verify your email. The link may have expired or is
              invalid.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
