import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";
import AppLayout from "../layouts/AppLayout";
import axios from "axios";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        token,
        password: formData.password,
      });
      setIsSubmitted(true);
      showToast("Password has been reset successfully", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to reset password",
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
                Enter your new password below
              </p>
            </div>

            {/* Form */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-primary"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="input"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-primary"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className="input"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm your new password"
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
                    {isLoading ? "Resetting..." : "Reset Password"}
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
                  Your password has been reset successfully
                </p>
                <p className="text-secondary text-sm">
                  Redirecting you to login...
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center">
              <p className="text-secondary">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-accent hover:text-accent -secondary transition-base"
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

export default ResetPasswordPage;
