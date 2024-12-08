import { Link } from "react-router-dom";

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">
          Access Forbidden
        </h2>
        <p className="text-gray-400 mb-8">
          You don't have permission to access this page.
        </p>
        <Link
          to="/"
          className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
