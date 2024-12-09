import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const { user: currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchUsers = useCallback(
    async (page = 1) => {
      if (!currentUser?.isAdmin) {
        setError("Unauthorized access");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get("/api/users", {
          params: { page, limit: pagination.limit },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "X-Admin-Action": "true",
          },
        });

        setUsers(response.data.users);
        setPagination({
          ...pagination,
          page,
          total: response.data.total,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching users");
        if (err.response?.status === 403) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    },
    [currentUser?.isAdmin, pagination.limit]
  );

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await axios.patch(
        `/api/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            "X-Admin-Action": "true",
            "X-Action-Reason": "role_update",
          },
        }
      );

      // Optimistic update
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success("Role updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting user");
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-dark-700 rounded-lg overflow-hidden">
          <thead className="bg-dark-600">
            <tr>
              <th className="px-6 py-3 text-left text-white">Name</th>
              <th className="px-6 py-3 text-left text-white">Email</th>
              <th className="px-6 py-3 text-left text-white">Role</th>
              <th className="px-6 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-dark-600">
                <td className="px-6 py-4 text-gray-300">{user.name}</td>
                <td className="px-6 py-4 text-gray-300">{user.email}</td>
                <td className="px-6 py-4 text-gray-300">{user.role}</td>
                <td className="px-6 py-4 space-x-2">
                  <select
                    className="bg-dark-600 text-white px-3 py-1 rounded"
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="representative">Representative</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
