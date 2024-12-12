import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AppLayout from "../layouts/AppLayout";
import axios from "axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("/api/auth/forgot-password", { email });
      setIsSubmitted(true);
      showToast(
        "Password reset instructions have been sent to your email",
        "success"
      );
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to send reset email",
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
                Reset Your Password
              </h1>
              <p className="mt-2 text-secondary">
                Enter your email address and we'll send you instructions to
                reset your password
              </p>
            </div>

            {/* Form */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full btn btn-primary ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Sending..." : "Send Reset Instructions"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
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
                <p className="text-primary">
                  Check your email for password reset instructions
                </p>
                <p className="text-secondary text-sm">
                  If you don't see the email, check your spam folder
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center">
              <p className="text-secondary">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-accent-primary hover:text-accent-secondary transition-base"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ForgotPasswordPage;
