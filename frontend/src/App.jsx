import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { SocketProvider } from "./contexts/SocketContext";
import LoginPage from "./components/auth/LoginPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import EmailVerificationPage from "./components/auth/EmailVerificationPage";
import ProfileWizard from "./components/profile/ProfileWizard";
import UserDashboard from "./components/dashboard/UserDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <ToastProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route
              path="/verify-email/:token"
              element={<EmailVerificationPage />}
            />

            {/* Protected Routes */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <ProfileWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </SocketProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
