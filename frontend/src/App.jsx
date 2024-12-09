import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import OrganizationRegistrationPage from "./pages/OrganizationRegistrationPage";
import RepresentativeRegistrationPage from "./pages/RepresentativeRegistrationPage";
import OrganizationDashboardPage from "./pages/OrganizationDashboardPage";
import RepresentativeDashboardPage from "./pages/RepresentativeDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CitizenDashboardPage from "./pages/CitizenDashboardPage";
import ForumPage from "./pages/ForumPage";
import PostDetailPage from "./pages/PostDetailPage";
import MessagesPage from "./pages/MessagesPage";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/register-organization"
            element={
              <PrivateRoute>
                <OrganizationRegistrationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/register-representative"
            element={
              <PrivateRoute>
                <RepresentativeRegistrationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/organization-dashboard"
            element={
              <PrivateRoute>
                <OrganizationDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/representative-dashboard"
            element={
              <PrivateRoute>
                <RepresentativeDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute>
                <AdminDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/citizen-dashboard"
            element={
              <PrivateRoute>
                <CitizenDashboardPage />
              </PrivateRoute>
            }
          />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/posts/:postId" element={<PostDetailPage />} />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagesPage />
              </PrivateRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" />
      </div>
    </Router>
  );
}

export default App;
