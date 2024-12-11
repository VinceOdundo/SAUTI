import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If a specific role is required and user doesn't have it
    if (user.role === "admin") {
      // Admins can access all routes
      return children;
    }

    // Redirect to appropriate dashboard based on user role
    const dashboardRoutes = {
      organization: "/organization/dashboard",
      representative: "/representative/dashboard",
      citizen: "/dashboard",
      admin: "/admin",
    };

    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }

  // If user is authenticated and has required role (or no specific role is required)
  return children;
};

export default PrivateRoute;
