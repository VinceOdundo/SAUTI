import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import MainLayout from "./components/layouts/MainLayout";
import HomePage from "./pages/HomePage";
import UserProfile from "./pages/UserProfile";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MessagingPage from "./pages/MessagingPage";
import RepresentativeDashboard from "./pages/RepresentativeDashboard";
import FeedbackPage from "./pages/FeedbackPage";
import CommunicationsPage from "./pages/CommunicationsPage.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import PrivateRoute from "./components/PrivateRoute";
import { ROLES } from "./constants/roles";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes with MainLayout */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile/:userId" element={<UserProfile />} />
                    <Route path="/messages" element={<MessagingPage />} />

                    {/* Representative Routes */}
                    <Route
                      path="/representative/*"
                      element={
                        <PrivateRoute roles={[ROLES.REPRESENTATIVE]}>
                          <Routes>
                            <Route
                              path="dashboard"
                              element={<RepresentativeDashboard />}
                            />
                            <Route path="feedback" element={<FeedbackPage />} />
                            <Route
                              path="communications"
                              element={<CommunicationsPage />}
                            />
                          </Routes>
                        </PrivateRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <PrivateRoute roles={[ROLES.ADMIN]}>
                          <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                          </Routes>
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
