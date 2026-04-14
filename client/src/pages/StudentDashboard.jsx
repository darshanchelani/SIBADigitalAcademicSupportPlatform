import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function StudentDashboard() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalQueries: 0,
    totalResponses: 0,
    byCategory: {},
    byStatus: {},
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await axios.get('/queries', {
        params: { userId: 'me' },
      });
      const data = response.data;
      setQueries(data);

      // Calculate analytics from queries
      const totalQueries = data.length;
      const totalResponses = data.filter(
        (q) => q.status === 'Resolved' || q.status === 'InProgress'
      ).length;
      const byCategory = {};
      const byStatus = { Open: 0, InProgress: 0, Resolved: 0, Closed: 0 };
      data.forEach((q) => {
        byCategory[q.category] = (byCategory[q.category] || 0) + 1;
        if (byStatus[q.status] !== undefined) byStatus[q.status]++;
      });
      setAnalytics({ totalQueries, totalResponses, byCategory, byStatus });
    } catch (error) {
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const barChartData = {
    labels: ['My Queries', 'Responded'],
    datasets: [
      {
        label: 'Count',
        data: [analytics.totalQueries, analytics.totalResponses],
        backgroundColor: ['rgba(99, 102, 241, 0.7)', 'rgba(16, 185, 129, 0.7)'],
        borderColor: ['rgb(99, 102, 241)', 'rgb(16, 185, 129)'],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const categoryLabels = Object.keys(analytics.byCategory);
  const categoryColors = {
    MRC: 'rgba(99, 102, 241, 0.7)',
    PRC: 'rgba(16, 185, 129, 0.7)',
    ERC: 'rgba(168, 85, 247, 0.7)',
  };
  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryLabels.map((k) => analytics.byCategory[k]),
        backgroundColor: categoryLabels.map((k) => categoryColors[k] || 'rgba(148, 163, 184, 0.7)'),
        borderWidth: 0,
      },
    ],
  };

  const statusChartData = {
    labels: Object.keys(analytics.byStatus),
    datasets: [
      {
        label: 'Queries',
        data: Object.values(analytics.byStatus),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(148, 163, 184, 0.7)',
        ],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Dashboard</h1>
          <p className="text-surface-500 text-sm mt-1">{queries.length} total queries</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/query/new')}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Query</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Queries',
            value: analytics.totalQueries,
            color: 'from-primary-500 to-primary-600',
            icon: '❓',
          },
          {
            label: 'Responded',
            value: analytics.totalResponses,
            color: 'from-accent-500 to-accent-600',
            icon: '✅',
          },
          {
            label: 'Open',
            value: analytics.byStatus.Open || 0,
            color: 'from-amber-500 to-amber-600',
            icon: '📂',
          },
          {
            label: 'Resolved',
            value: analytics.byStatus.Resolved || 0,
            color: 'from-green-500 to-green-600',
            icon: '🎯',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {stat.value}
              </span>
            </div>
            <p className="text-sm text-surface-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {queries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Query vs Response Bar Chart */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-sm font-semibold text-surface-700 mb-4">Queries vs Responses</h3>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
          {/* Category Doughnut */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <h3 className="text-sm font-semibold text-surface-700 mb-4">By Category</h3>
            {categoryLabels.length > 0 ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                }}
              />
            ) : (
              <p className="text-sm text-surface-400 text-center py-8">No data yet</p>
            )}
          </div>
          {/* Status Bar Chart */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-semibold text-surface-700 mb-4">By Status</h3>
            <Bar
              data={statusChartData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
              }}
            />
          </div>
        </div>
      )}

      {/* My Queries List */}
      <h2 className="text-lg font-bold text-surface-900 mb-4">My Queries</h2>

      {queries.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-surface-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-surface-600 mb-1 font-medium">No queries yet</p>
          <p className="text-surface-400 text-sm mb-6">Get started by creating your first query</p>
          <button onClick={() => navigate('/dashboard/query/new')} className="btn-primary">
            Create Your First Query
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {queries.map((query, i) => (
            <div
              key={query._id}
              className="card p-5 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => navigate(`/dashboard/query/${query._id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-surface-900 mb-1.5">{query.title}</h3>
                  <p className="text-surface-500 text-sm mb-3 line-clamp-2">{query.content}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                      className={`badge-${query.category === 'MRC' ? 'blue' : query.category === 'PRC' ? 'green' : 'purple'}`}
                    >
                      {query.category}
                    </span>
                    {query.moderationStatus === 'Pending' ? (
                      <span className="badge-yellow">Pending Approval</span>
                    ) : query.moderationStatus === 'Rejected' ? (
                      <span className="badge-red">Rejected</span>
                    ) : (
                      <span
                        className={`badge-${query.status === 'Resolved' ? 'green' : query.status === 'InProgress' ? 'yellow' : 'gray'}`}
                      >
                        {query.status}
                      </span>
                    )}
                    <span className="text-surface-400 text-xs">
                      {new Date(query.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-surface-300 flex-shrink-0 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
