import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function ModeratorDashboard() {
  const [queue, setQueue] = useState([]);
  const [filteredQueue, setFilteredQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('oldest');
  const [stats, setStats] = useState({ total: 0, pending: 0, open: 0, inProgress: 0 });
  const [moderatorStats, setModeratorStats] = useState({ myResponses: 0, todayResponses: 0 });
  const [queueType, setQueueType] = useState('all'); // 'all', 'pending', 'active'
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingQueryId, setRejectingQueryId] = useState(null);
  const [aiProvider, setAiProvider] = useState('auto');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
    fetchModeratorStats();
  }, [queueType]);

  const fetchModeratorStats = async () => {
    try {
      const response = await axios.get('/moderator/stats');
      setModeratorStats(response.data);
    } catch (error) {
      console.error('Failed to load moderator stats');
    }
  };

  useEffect(() => {
    applyFilters();
  }, [queue, filter, searchTerm, sortBy]);

  const fetchQueue = async () => {
    try {
      const response = await axios.get('/moderator/queue', { params: { type: queueType } });
      setQueue(response.data);

      // Calculate stats
      const total = response.data.length;
      const pending = response.data.filter((q) => q.moderationStatus === 'Pending').length;
      const open = response.data.filter(
        (q) => q.status === 'Open' && q.moderationStatus === 'Approved'
      ).length;
      const inProgress = response.data.filter(
        (q) => q.status === 'InProgress' && q.moderationStatus === 'Approved'
      ).length;
      setStats({ total, pending, open, inProgress });

      // Refresh moderator stats
      fetchModeratorStats();
    } catch (error) {
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...queue];

    // Category filter
    if (filter.category) {
      filtered = filtered.filter((q) => q.category === filter.category);
    }

    // Status filter (only for approved queries)
    if (filter.status) {
      filtered = filtered.filter(
        (q) => q.status === filter.status && q.moderationStatus === 'Approved'
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(term) ||
          (q.content && q.content.toLowerCase().includes(term)) ||
          (q.userId?.name && q.userId.name.toLowerCase().includes(term))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.timestamp) - new Date(b.timestamp);
      } else if (sortBy === 'newest') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    setFilteredQueue(filtered);
  };

  const handleStatusChange = async (queryId, newStatus) => {
    try {
      await axios.patch(`/queries/${queryId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchQueue();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCloseQuery = async (queryId) => {
    if (!window.confirm('Are you sure you want to close this query?')) {
      return;
    }
    try {
      await axios.post('/moderator/close-query', { queryId });
      toast.success('Query closed successfully');
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close query');
    }
  };

  const handleGenerateDraft = async (queryId) => {
    try {
      const payload = { queryId };
      if (aiProvider !== 'auto') payload.provider = aiProvider;
      const response = await axios.post('/moderator/generate-draft', payload);
      navigate(`/dashboard/moderator/queue/${queryId}`, { state: { draft: response.data } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate draft');
    }
  };

  const handleApproveQuery = async (queryId) => {
    try {
      await axios.post('/moderator/approve-query', { queryId });
      toast.success('Query approved successfully!');
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve query');
    }
  };

  const handleRejectQuery = async (queryId) => {
    if (!rejectReason.trim() && !window.confirm('Reject without providing a reason?')) {
      return;
    }
    try {
      await axios.post('/moderator/reject-query', {
        queryId,
        rejectionReason: rejectReason || undefined,
      });
      toast.success('Query rejected');
      setRejectingQueryId(null);
      setRejectReason('');
      fetchQueue();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject query');
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
        <h1 className="page-title">Moderation Queue</h1>
        <button onClick={fetchQueue} className="btn-secondary inline-flex items-center space-x-2">
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

      {/* Queue Type Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'All Queries' },
          { key: 'pending', label: `Pending (${stats.pending})` },
          { key: 'active', label: 'Active' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setQueueType(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${queueType === tab.key ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-surface-600 hover:bg-surface-50 border border-surface-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Pending', value: stats.pending, color: 'text-red-600', bg: 'bg-red-50' },
          {
            label: 'Active',
            value: stats.total - stats.pending,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
          { label: 'Open', value: stats.open, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          {
            label: 'In Progress',
            value: stats.inProgress,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
          {
            label: 'My Responses',
            value: moderatorStats.myResponses,
            color: 'text-accent-600',
            bg: 'bg-accent-50',
          },
          {
            label: 'Today',
            value: moderatorStats.todayResponses,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-2xl p-4 animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className="text-xs font-medium text-surface-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, content, or user..."
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="input-modern"
            >
              <option value="">All Categories</option>
              <option value="MRC">MRC</option>
              <option value="PRC">PRC</option>
              <option value="ERC">ERC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input-modern"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="InProgress">In Progress</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-modern"
            >
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilter({ category: '', status: '' });
                setSearchTerm('');
                setSortBy('oldest');
              }}
              className="btn-secondary w-full"
            >
              Clear All Filters
            </button>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-surface-400">
              Showing {filteredQueue.length} of {queue.length} queries
            </p>
          </div>
        </div>
      </div>

      {/* Queue List */}
      {filteredQueue.length === 0 ? (
        <div className="card p-10 text-center">
          <svg
            className="w-12 h-12 text-surface-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-surface-500">
            {queue.length === 0
              ? 'No queries in the queue.'
              : 'No queries match the selected filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQueue.map((query, i) => (
            <div
              key={query._id}
              className="card p-5 hover:shadow-card-hover transition-shadow animate-fade-in-up"
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
                    {query.moderationStatus === 'Pending' ? (
                      <span className="badge-red">Pending Approval</span>
                    ) : (
                      <span
                        className={`badge-${query.status === 'Closed' ? 'gray' : query.status === 'Resolved' ? 'green' : query.status === 'InProgress' ? 'yellow' : 'blue'}`}
                      >
                        {query.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500 mb-3 line-clamp-2">{query.content}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400">
                    <span className="inline-flex items-center space-x-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{query.userId?.name}</span>
                    </span>
                    <span>{new Date(query.timestamp).toLocaleString()}</span>
                    {query.attachments && query.attachments.length > 0 && (
                      <span className="inline-flex items-center space-x-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                        <span>{query.attachments.length} file(s)</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4 shrink-0">
                  {query.moderationStatus === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleApproveQuery(query._id)}
                        className="px-4 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectingQueryId(query._id)}
                        className="btn-danger text-sm"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/dashboard/moderator/queue/${query._id}`)}
                        className="btn-primary text-sm"
                      >
                        Review
                      </button>
                      <div className="flex items-center space-x-1">
                        <select
                          value={aiProvider}
                          onChange={(e) => setAiProvider(e.target.value)}
                          className="input-modern text-xs py-2 px-2 rounded-lg w-[85px]"
                        >
                          <option value="auto">Auto</option>
                          <option value="openai">OpenAI</option>
                          <option value="gemini">Gemini</option>
                        </select>
                        <button
                          onClick={() => handleGenerateDraft(query._id)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                          AI Draft
                        </button>
                      </div>
                      {query.status === 'Open' && (
                        <button
                          onClick={() => handleStatusChange(query._id, 'InProgress')}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors text-sm font-medium"
                        >
                          In Progress
                        </button>
                      )}
                      {query.status !== 'Closed' && query.moderationStatus === 'Approved' && (
                        <button
                          onClick={() => handleCloseQuery(query._id)}
                          className="btn-secondary text-sm"
                        >
                          Close
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingQueryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-scale-in">
            <h2 className="text-xl font-bold text-surface-900 mb-4">Reject Query</h2>
            <div className="mb-5">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="input-modern resize-none"
                placeholder="Provide a reason for rejection..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleRejectQuery(rejectingQueryId)}
                className="btn-danger flex-1"
              >
                Reject Query
              </button>
              <button
                onClick={() => {
                  setRejectingQueryId(null);
                  setRejectReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModeratorDashboard;
