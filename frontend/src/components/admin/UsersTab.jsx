import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${backendUrl}/api/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${backendUrl}/api/admin/users/${editingUser._id}`,
        editingUser,
      );
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl mb-6 text-primary">Manage Users</h2>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 blur-backdrop">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md p-6 border border-primary/20">
            <h3 className="text-xl mb-4 text-primary">Edit User</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-secondary mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-secondary mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-[#d00000] transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-[#2a2a2a] text-secondary py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="text-left py-3 px-4 text-secondary">User</th>
              <th className="text-left py-3 px-4 text-secondary">Email</th>
              <th className="text-left py-3 px-4 text-secondary">Role</th>
              <th className="text-left py-3 px-4 text-secondary">Joined</th>
              <th className="text-left py-3 px-4 text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-primary/10 hover:bg-primary/5"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <span className="text-primary text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-white">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-secondary">{user.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-1 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                      title="Edit user"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete user"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <div className="text-center py-12 bg-[#2a2a2a] rounded-lg border border-primary/20">
          <p className="text-secondary">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
