import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../features/auth/authAPI";
import AuthNav from "../components/AuthNav";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(login(credentials)).unwrap();
      navigate("/");
    } catch (error) {
      // Error handling is already done in the reducer
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-dark-800 py-12 px-4 sm:px-6 lg:px-8">
      <AuthNav isAuthenticated={false} />
      <div className="max-w-md w-full space-y-8 bg-dark-700 p-8 rounded-xl border border-dark-600">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-900/50 text-red-200 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-gray-300 text-sm font-medium"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="appearance-none relative block w-full mt-1 px-3 py-2 border border-dark-500 bg-dark-800 text-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-gray-300 text-sm font-medium"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="appearance-none relative block w-full mt-1 px-3 py-2 border border-dark-500 bg-dark-800 text-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
