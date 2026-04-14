import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBadge, setNewBadge] = useState({ name: '', description: '' });
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchBadges();
    fetchUsers();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/admin/badges');
      setBadges(response.data);
    } catch (error) {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users', { params: { limit: 100 } });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/admin/badges', newBadge);
      toast.success('Badge created successfully');
      setShowCreateModal(false);
      setNewBadge({ name: '', description: '' });
      fetchBadges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create badge');
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) {
      return;
    }

    try {
      await axios.delete(`/admin/badges/${badgeId}`);
      toast.success('Badge deleted successfully');
      fetchBadges();
    } catch (error) {
      toast.error('Failed to delete badge');
    }
  };

  const handleAssignBadge = async (badgeId) => {
    if (!assignUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await axios.post(`/admin/badges/${badgeId}/assign`, { userId: assignUserId });
      toast.success('Badge assigned successfully');
      setSelectedBadge(null);
      setAssignUserId('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign badge');
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
        <h1 className="page-title">Badge Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Badge</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, i) => (
          <div
            key={badge._id}
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-bold text-surface-900 mb-1">{badge.name}</h3>
                <p className="text-sm text-surface-500">{badge.description}</p>
              </div>
              <div className="p-2.5 bg-yellow-50 rounded-xl">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => {
                  setSelectedBadge(badge);
                  setAssignUserId('');
                }}
                className="btn-accent flex-1 text-sm"
              >
                Assign
              </button>
              <button onClick={() => handleDeleteBadge(badge._id)} className="btn-danger text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Badge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-scale-in">
            <h2 className="text-xl font-bold text-surface-900 mb-4">Create Badge</h2>
            <form onSubmit={handleCreateBadge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  required
                  className="input-modern"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                  required
                  rows={3}
                  className="input-modern resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBadge({ name: '', description: '' });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Badge Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-scale-in">
            <h2 className="text-xl font-bold text-surface-900 mb-4">
              Assign: {selectedBadge.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Select User
                </label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="input-modern"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAssignBadge(selectedBadge._id)}
                  className="btn-accent flex-1"
                >
                  Assign
                </button>
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    setAssignUserId('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBadges;
