import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const MainLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      { label: "Home", path: "/", icon: "home" },
      { label: "Profile", path: `/profile/${user._id}`, icon: "user" },
      { label: "Messages", path: "/messages", icon: "message" },
    ];

    if (user.role === "admin") {
      return [
        ...commonItems,
        { label: "Admin Dashboard", path: "/admin", icon: "dashboard" },
        { label: "User Management", path: "/admin/users", icon: "users" },
      ];
    }

    if (user.role === "representative") {
      return [
        ...commonItems,
        {
          label: "Dashboard",
          path: "/representative/dashboard",
          icon: "dashboard",
        },
        {
          label: "Feedback",
          path: "/representative/feedback",
          icon: "feedback",
        },
        {
          label: "Communications",
          path: "/representative/communications",
          icon: "broadcast",
        },
      ];
    }

    return commonItems;
  };

  return (
    <div className="min-h-screen bg-dark-800">
      <nav className="bg-dark-700 fixed w-64 h-screen p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Sauti</h1>
        </div>

        <div className="space-y-2">
          {getMenuItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-primary-500 text-white"
                  : "text-gray-300 hover:bg-dark-600"
              }`}
            >
              <i className={`icon-${item.icon} mr-3`} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="ml-64 p-8">{children}</main>
    </div>
  );
};

export default MainLayout;
