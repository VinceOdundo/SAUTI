import React from "react";
import PropTypes from "prop-types";

const LoadingSpinner = ({
  size = "md",
  color = "primary",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colorClasses = {
    primary: "border-primary-600",
    secondary: "border-gray-600",
    white: "border-white",
  };

  const spinnerClasses = `
    animate-spin rounded-full
    border-2 border-t-transparent
    ${sizeClasses[size]}
    ${colorClasses[color]}
  `;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className={spinnerClasses}></div>
      </div>
    );
  }

  return <div className={spinnerClasses}></div>;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  color: PropTypes.oneOf(["primary", "secondary", "white"]),
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
