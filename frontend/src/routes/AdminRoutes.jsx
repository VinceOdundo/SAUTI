import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminDashboard from "../components/admin/AdminDashboard";
import VerificationRequests from "../components/admin/VerificationRequests";
import ContentModeration from "../components/admin/ContentModeration";
import UserManagement from "../components/admin/UserManagement";
import SystemSettings from "../components/admin/SystemSettings";

const AdminRoutes = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated or not an admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/verifications" element={<VerificationRequests />} />
      <Route path="/moderation" element={<ContentModeration />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/settings" element={<SystemSettings />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
