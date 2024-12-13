import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AppLayout from "../layouts/AppLayout";
import axios from "axios";

const EmailVerificationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const verifyEmail = async (verificationToken) => {
    setIsLoading(true);
    try {
      await axios.post("/auth/verify-email", { token: verificationToken });
      setIsVerified(true);
      showToast("Email verified successfully", "success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Email verification failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    try {
      await axios.post("/auth/resend-verification");
      showToast("Verification email sent successfully", "success");
      setCountdown(60);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to send verification email",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="card space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary">
                {isVerified
                  ? "Email Verified!"
                  : token
                  ? "Verifying Email..."
                  : "Check Your Email"}
              </h1>
              <p className="mt-2 text-secondary">
                {isVerified
                  ? "Your email has been verified successfully"
                  : token
                  ? "Please wait while we verify your email address"
                  : "We've sent you an email with a verification link"}
              </p>
            </div>

            {/* Content */}
            <div className="text-center space-y-6">
              {isVerified ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-bg text-success-text">
                    <svg
                      className="w-6 h-6"
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
                  <p className="text-secondary text-sm">
                    Redirecting you to login...
                  </p>
                </div>
              ) : token ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-info-bg text-info-text">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-secondary">
                      Didn't receive the email? Check your spam folder or
                    </p>
                    <button
                      onClick={resendVerification}
                      disabled={isLoading || countdown > 0}
                      className={`btn btn-secondary ${
                        isLoading || countdown > 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {countdown > 0
                        ? `Resend in ${countdown}s`
                        : isLoading
                        ? "Sending..."
                        : "Resend verification email"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-secondary">
                Need help?{" "}
                <Link
                  to="/contact"
                  className="text-accent hover:text-accent -secondary transition-base"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmailVerificationPage;
