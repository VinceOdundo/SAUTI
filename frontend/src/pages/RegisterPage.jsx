import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/layouts/AppLayout";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      showToast("Registration successful", "success");
      navigate("/");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Registration failed",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-bg-secondary px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-bg-primary shadow-sm border border-border rounded-lg px-8 py-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary text-center">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-text-secondary text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-accent-primary hover:text-accent-secondary"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-primary"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors duration-200"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors duration-200"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-primary"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors duration-200"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-text-primary"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-bg-primary border border-border rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-colors duration-200"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-primary hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary transition-colors duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default RegisterPage;
