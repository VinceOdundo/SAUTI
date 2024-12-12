import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-base-secondary transition-base">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-base border-b border-border transition-base">
        <div className="container h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo and Primary Navigation */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-xl font-semibold text-primary hover:text-accent transition-base"
              >
                SAUTI
              </Link>

              {user && (
                <nav className="hidden md:flex space-x-6">
                  <Link
                    to="/dashboard"
                    className="text-secondary hover:text-primary transition-base"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/explore"
                    className="text-secondary hover:text-primary transition-base"
                  >
                    Explore
                  </Link>
                  <Link
                    to="/representatives"
                    className="text-secondary hover:text-primary transition-base"
                  >
                    Representatives
                  </Link>
                </nav>
              )}
            </div>

            {/* User Navigation */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="p-2 rounded-full text-secondary hover:text-primary hover:bg-hover-bg transition-base"
                    title="Notifications"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </Link>

                  {/* Profile Menu */}
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-hover-bg transition-base"
                  >
                    <img
                      src={user.profileImage || "/default-avatar.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-border"
                    />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-primary hover:text-accent transition-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-secondary bg-accent-primary hover:bg-accent-secondary rounded-md transition-base"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-[calc(100vh-4rem)]">{children}</main>

      {/* Footer */}
      <footer className="bg-base border-t border-border transition-base">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                About Sauti
              </h3>
              <p className="text-secondary">
                Connecting citizens with their representatives for better
                governance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-secondary hover:text-accent transition-base"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-secondary hover:text-accent transition-base"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-secondary hover:text-accent transition-base"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/help"
                    className="text-secondary hover:text-accent transition-base"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guidelines"
                    className="text-secondary hover:text-accent transition-base"
                  >
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-secondary hover:text-accent transition-base"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">
                Connect
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/sauti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-accent transition-base"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com/sauti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-accent transition-base"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/company/sauti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-accent transition-base"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-secondary">
            <p>&copy; {new Date().getFullYear()} Sauti. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
