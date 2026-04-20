import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmDialog';

function AdminQueries() {
  const confirm = useConfirm();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueries();
  }, [filters]);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const response = await axios.get('/admin/queries', { params });
      setQueries(response.data.queries || []);
    } catch (error) {
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (queryId) => {
    const ok = await confirm({
      title: 'Delete this query?',
      message: 'The query and all of its responses and attachments will be removed permanently.',
      confirmLabel: 'Delete query',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      await axios.delete(`/admin/queries/${queryId}`);
      toast.success('Query deleted successfully');
      fetchQueries();
    } catch (error) {
      toast.error('Failed to delete query');
    }
  };

  const handleStatusChange = async (queryId, newStatus) => {
    try {
      await axios.patch(`/admin/queries/${queryId}`, { status: newStatus });
      toast.success('Status updated');
      fetchQueries();
    } catch (error) {
      toast.error('Failed to update status');
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
      <h1 className="page-title mb-6">Query Management</h1>

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search queries..."
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-modern"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-modern"
            >
              <option value="">All Categories</option>
              <option value="MRC">MRC</option>
              <option value="PRC">PRC</option>
              <option value="ERC">ERC</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', category: '', search: '' })}
              className="btn-secondary w-full"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-3">
        {queries.map((query, i) => (
          <div
            key={query._id}
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-surface-900">{query.title}</h3>
                  <span
                    className={`badge-${query.category === 'MRC' ? 'blue' : query.category === 'PRC' ? 'green' : 'purple'}`}
                  >
                    {query.category}
                  </span>
                  <select
                    value={query.status}
                    onChange={(e) => handleStatusChange(query._id, e.target.value)}
                    className="text-sm px-3 py-1 border border-surface-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <p className="text-sm text-surface-500 mb-2 line-clamp-2">{query.content}</p>
                <div className="text-xs text-surface-400">
                  <span>By: {query.userId?.name}</span>
                  <span className="ml-4">{new Date(query.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4 shrink-0">
                <button
                  onClick={() => navigate(`/dashboard/query/${query._id}`)}
                  className="btn-primary text-sm"
                >
                  View
                </button>
                <button onClick={() => handleDelete(query._id)} className="btn-danger text-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminQueries;
