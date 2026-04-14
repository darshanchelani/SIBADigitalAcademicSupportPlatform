import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ role: '', points: 0 });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      const response = await axios.get('/admin/users', { params });
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    if (
      !window.confirm(
        'Are you sure you want to make this user an Admin? They will have full system access.'
      )
    ) {
      return;
    }
    try {
      await axios.patch(`/admin/users/${userId}/role`, { role: 'Admin' });
      toast.success('User promoted to Admin');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote user');
    }
  };

  const handlePromoteToModerator = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/role`, { role: 'Moderator' });
      toast.success('User promoted to Moderator');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  const handleDemoteToUser = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/role`, { role: 'User' });
      toast.success('User demoted to User');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to demote user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    ) {
      return;
    }

    try {
      await axios.delete(`/admin/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({ role: user.role, points: user.points || 0 });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (editForm.role !== selectedUser.role) {
        // Warn if promoting to Admin
        if (editForm.role === 'Admin' && selectedUser.role !== 'Admin') {
          if (
            !window.confirm(
              `Are you sure you want to make ${selectedUser.name} an Admin? They will have full system access.`
            )
          ) {
            return;
          }
        }
        await axios.patch(`/admin/users/${selectedUser._id}/role`, { role: editForm.role });
      }
      if (editForm.points !== selectedUser.points) {
        await axios.patch(`/admin/users/${selectedUser._id}/points`, { points: editForm.points });
      }
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">User Management</h1>
        <button onClick={fetchUsers} className="btn-secondary inline-flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-modern"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="User">User</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
              }}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-surface-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-surface-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge-${user.role === 'Admin' ? 'red' : user.role === 'Moderator' ? 'purple' : 'blue'}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-surface-900">{user.points || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        Edit
                      </button>
                      {user.role !== 'Admin' && (
                        <button
                          onClick={() => handlePromoteToAdmin(user._id)}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Admin
                        </button>
                      )}
                      {user.role === 'User' && (
                        <button
                          onClick={() => handlePromoteToModerator(user._id)}
                          className="text-accent-600 hover:text-accent-800 font-medium"
                        >
                          Moderator
                        </button>
                      )}
                      {(user.role === 'Moderator' || user.role === 'Admin') && (
                        <button
                          onClick={() => handleDemoteToUser(user._id)}
                          className="text-orange-600 hover:text-orange-800 font-medium"
                        >
                          Demote
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-scale-in">
            <h2 className="text-xl font-bold text-surface-900 mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input-modern"
                >
                  <option value="User">User</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Points</label>
                <input
                  type="number"
                  value={editForm.points}
                  onChange={(e) =>
                    setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })
                  }
                  className="input-modern"
                  min="0"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={handleSaveEdit} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
