import React from "react";
import { Link } from "react-router-dom";

const AuthNav = ({ isAuthenticated }) => {
  if (isAuthenticated) return null;

  return (
    <div className="bg-dark-800 p-4 text-center">
      <div className="space-x-4">
        <Link
          to="/register"
          className="text-primary-500 hover:text-primary-600"
        >
          New user? Sign up here
        </Link>
        <span className="text-gray-400">|</span>
        <Link
          to="/forgot-password"
          className="text-primary-500 hover:text-primary-600"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
};

export default AuthNav;
