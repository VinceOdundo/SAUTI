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
    <div className="min-h-screen flex flex-col justify-center bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <AuthNav isAuthenticated={false} />
      <div className="max-w-md w-full space-y-8 bg-bg-secondary p-8 rounded-xl border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-error-bg text-error-text p-4 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-text-secondary text-sm font-medium"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="appearance-none relative block w-full mt-1 px-3 py-2 border border-border bg-bg-primary text-text-primary rounded-lg focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-text-secondary text-sm font-medium"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="appearance-none relative block w-full mt-1 px-3 py-2 border border-border bg-bg-primary text-text-primary rounded-lg focus:outline-none focus:ring-accent-primary focus:border-accent-primary"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-bg-primary bg-accent-primary hover:bg-accent-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary transition-colors duration-200"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-accent-primary hover:text-accent-secondary text-sm"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
