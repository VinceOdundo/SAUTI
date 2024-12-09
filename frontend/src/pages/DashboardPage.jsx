import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "ngo":
        case "cbo":
          navigate("/organization-dashboard");
          break;
        case "representative":
          navigate("/representative-dashboard");
          break;
        case "admin":
          navigate("/admin-dashboard");
          break;
        default:
          // Regular user dashboard
          navigate("/citizen-dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-xl text-gray-600">
        Redirecting to your dashboard...
      </div>
    </div>
  );
};

export default DashboardPage;
