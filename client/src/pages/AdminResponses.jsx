import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminResponses() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ queryId: '', responseType: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchResponses();
  }, [filters]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.queryId) params.queryId = filters.queryId;
      if (filters.responseType) params.responseType = filters.responseType;

      const response = await axios.get('/admin/responses', { params });
      setResponses(response.data.responses || []);
    } catch (error) {
      toast.error('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (responseId) => {
    if (!window.confirm('Are you sure you want to delete this response?')) {
      return;
    }

    try {
      await axios.delete(`/admin/responses/${responseId}`);
      toast.success('Response deleted successfully');
      fetchResponses();
    } catch (error) {
      toast.error('Failed to delete response');
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
      <h1 className="page-title mb-6">Response Management</h1>

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Response Type
            </label>
            <select
              value={filters.responseType}
              onChange={(e) => setFilters({ ...filters, responseType: e.target.value })}
              className="input-modern"
            >
              <option value="">All Types</option>
              <option value="Text">Text</option>
              <option value="Audio">Audio</option>
              <option value="Video">Video</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ queryId: '', responseType: '' })}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-3">
        {responses.map((response, i) => (
          <div
            key={response._id}
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-surface-900">
                    {response.moderatorId?.name || 'Unknown'}
                  </span>
                  <span
                    className={`badge-${response.moderatorId?.role === 'Moderator' || response.moderatorId?.role === 'Admin' ? 'purple' : 'green'}`}
                  >
                    {response.moderatorId?.role || 'User'}
                  </span>
                  <span className="badge-blue">{response.responseType}</span>
                </div>
                <p className="text-sm text-surface-600 mb-2 line-clamp-3">
                  {response.responseText}
                </p>
                <div className="text-xs text-surface-400">
                  <span>Query: {response.queryId?.title}</span>
                  <span className="ml-4">{new Date(response.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4 shrink-0">
                <button
                  onClick={() => navigate(`/dashboard/query/${response.queryId?._id}`)}
                  className="btn-primary text-sm"
                >
                  View
                </button>
                <button onClick={() => handleDelete(response._id)} className="btn-danger text-sm">
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

export default AdminResponses;
