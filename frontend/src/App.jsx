import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { SocketProvider } from "./contexts/SocketContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import EmailVerificationPage from "./components/auth/EmailVerificationPage";
import ProfileWizard from "./components/profile/ProfileWizard";
import UserDashboard from "./components/dashboard/UserDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Timeline from "./components/Timeline";
import { useAuth } from "./hooks/useAuth";
import "./styles/themes.css";

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SocketProvider>
              <div className="transition-colors duration-200">
                <Routes>
                  <Route path="/" element={<RootRoute />} />

                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
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
              </div>
            </SocketProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

const RootRoute = () => {
  const { user } = useAuth();
  return user ? <Timeline /> : <LandingPage />;
};

export default App;
