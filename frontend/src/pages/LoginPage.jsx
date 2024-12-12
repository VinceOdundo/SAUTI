import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../features/auth/authAPI";
import AuthNav from "../components/AuthNav";
import AppLayout from "../components/AppLayout";

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
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-secondary px-4 py-12">
        <div className="form-container">
          <div className="form-card">
            <div>
              <h2 className="text-2xl font-bold text-primary text-center">
                Sign In
              </h2>
              <p className="mt-2 text-sm text-secondary text-center">
                Don't have an account?{" "}
                <Link to="/register" className="link">
                  Create one
                </Link>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="form-group">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoginPage;
