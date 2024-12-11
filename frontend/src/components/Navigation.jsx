import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { theme } from "../theme";
import NotificationBell from "./NotificationBell";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Forum", href: "/forum" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const authNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Messages", href: "/messages" },
];

export default function Navigation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-md">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/">
                    <img
                      className="h-12 w-auto"
                      src="/assets/logo.svg"
                      alt="Sauti"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-gray-600 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 border-transparent"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                      <span>{user?.name}</span>
                      <img
                        src={user?.avatar || "/default-avatar.png"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border border-gray-200"
                      />
                    </button>
                    <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-lg hidden group-hover:block border border-gray-100">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
