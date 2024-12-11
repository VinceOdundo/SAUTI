import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const AuthRoute = ({ children, requiredRole, sessionTimeout = 3600000 }) => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  // Check session timeout
  React.useEffect(() => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (lastActivity && Date.now() - parseInt(lastActivity) > sessionTimeout) {
      toast.warning("Session expired. Please login again.");
      logout();
    }

    // Update last activity
    const updateLastActivity = () => {
      localStorage.setItem("lastActivity", Date.now().toString());
    };

    // Update on route change and user interaction
    updateLastActivity();
    window.addEventListener("click", updateLastActivity);
    window.addEventListener("keypress", updateLastActivity);
    window.addEventListener("scroll", updateLastActivity);
    window.addEventListener("mousemove", updateLastActivity);

    return () => {
      window.removeEventListener("click", updateLastActivity);
      window.removeEventListener("keypress", updateLastActivity);
      window.removeEventListener("scroll", updateLastActivity);
      window.removeEventListener("mousemove", updateLastActivity);
    };
  }, [sessionTimeout, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    // Store the attempted URL for redirect after login
    localStorage.setItem("returnUrl", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (requiredRole) {
    const hasAccess = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole || user.role === "admin";

    if (!hasAccess) {
      toast.error("You don't have permission to access this page");

      // Redirect to appropriate dashboard based on user role
      const dashboardRoutes = {
        organization: "/organization/dashboard",
        representative: "/representative/dashboard",
        citizen: "/dashboard",
        admin: "/admin",
      };

      return (
        <Navigate to={dashboardRoutes[user.role] || "/dashboard"} replace />
      );
    }
  }

  // Check if user's email is verified for sensitive routes
  const requiresVerification =
    location.pathname.includes("/sensitive") ||
    location.pathname.includes("/settings");

  if (requiresVerification && !user.emailVerified) {
    toast.warning("Please verify your email to access this page");
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthRoute;
