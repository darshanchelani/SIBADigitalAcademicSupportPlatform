import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQueries: 0,
    totalUsers: 0,
    totalModerators: 0,
    resolvedQueries: 0,
    pendingQueries: 0,
    totalResponses: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [queriesRes, analyticsRes, usersRes] = await Promise.all([
        axios.get('/queries'),
        axios.get('/analytics/dashboard'),
        axios.get('/admin/users', { params: { limit: 1000 } }),
      ]);

      const users = usersRes.data.users || [];
      const moderators = users.filter((u) => u.role === 'Moderator').length;

      setStats({
        totalQueries: queriesRes.data.length || 0,
        totalUsers: users.length,
        totalModerators: moderators,
        resolvedQueries: queriesRes.data.filter((q) => q.status === 'Resolved').length,
        pendingQueries: queriesRes.data.filter((q) => q.status === 'Open').length,
        totalResponses: analyticsRes.data.responseCount || 0,
        activeUsers: analyticsRes.data.activeUsers || 0,
        avgResolutionTime: analyticsRes.data.avgResolutionTime || 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <h1 className="page-title">Admin Dashboard</h1>
        <button onClick={fetchStats} className="btn-secondary inline-flex items-center space-x-2">
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Users',
            value: stats.totalUsers,
            sub: `${stats.totalModerators} Moderators`,
            color: 'primary',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
          },
          {
            label: 'Total Queries',
            value: stats.totalQueries,
            sub: `${stats.resolvedQueries} Resolved`,
            color: 'accent',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
          },
          {
            label: 'Pending Queries',
            value: stats.pendingQueries,
            sub: 'Awaiting response',
            color: 'yellow',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          },
          {
            label: 'Total Responses',
            value: stats.totalResponses,
            sub: 'All responses',
            color: 'purple',
            icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                <p className="text-xs text-surface-400 mt-1">{stat.sub}</p>
              </div>
              <div className={`p-2.5 bg-${stat.color}-50 rounded-xl`}>
                <svg
                  className={`w-5 h-5 text-${stat.color}-500`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={stat.icon}
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {[
          {
            title: 'User Management',
            desc: 'Manage users, promote to moderators, assign roles',
            path: '/dashboard/admin/users',
            color: 'primary',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
          },
          {
            title: 'Query Management',
            desc: 'View, edit, delete all queries in the system',
            path: '/dashboard/admin/queries',
            color: 'accent',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
          },
          {
            title: 'Badge Management',
            desc: 'Create badges and assign them to users',
            path: '/dashboard/admin/badges',
            color: 'purple',
            icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
          },
          {
            title: 'Analytics',
            desc: 'View detailed analytics and reports',
            path: '/dashboard/admin/analytics',
            color: 'primary',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="card p-5 hover:shadow-card-hover transition-shadow animate-fade-in-up"
            style={{ animationDelay: `${(i + 4) * 0.05}s` }}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 bg-${item.color}-50 rounded-xl shrink-0`}>
                <svg
                  className={`w-6 h-6 text-${item.color}-600`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-surface-900 mb-1">{item.title}</h2>
                <p className="text-sm text-surface-500 mb-3">{item.desc}</p>
                <button onClick={() => navigate(item.path)} className={`btn-primary text-sm`}>
                  Manage {item.title.split(' ')[0]} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: 'Moderation Queue',
              desc: 'Review pending queries',
              path: '/dashboard/moderator/queue',
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
            },
            {
              label: 'Response Management',
              desc: 'View all responses',
              path: '/dashboard/admin/responses',
              icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
            },
            {
              label: 'Leaderboard',
              desc: 'View rankings',
              path: '/dashboard/gamification',
              icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
            },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="px-4 py-3.5 bg-surface-50 hover:bg-surface-100 rounded-xl transition-colors text-left border border-surface-100 group"
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-surface-400 group-hover:text-primary-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={action.icon}
                  />
                </svg>
                <div>
                  <div className="font-medium text-surface-800 text-sm">{action.label}</div>
                  <div className="text-xs text-surface-400">{action.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
