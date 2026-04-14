import React from 'react';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
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

  if (!dashboardData) {
    return <div className="text-surface-500 text-center py-8">No data available</div>;
  }

  // Category Usage Chart
  const categoryData = {
    labels: dashboardData.categoryUsage?.map((c) => c._id) || [],
    datasets: [
      {
        label: 'Queries by Category',
        data: dashboardData.categoryUsage?.map((c) => c.count) || [],
        backgroundColor: ['#6366f1', '#10b981', '#8b5cf6'],
      },
    ],
  };

  // Time Series (mock data for now)
  const timeSeriesData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Queries',
        data: [12, 19, 15, 25],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
      },
      {
        label: 'Responses',
        data: [10, 17, 13, 23],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title mb-6">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Queries', value: dashboardData.queryCount, color: 'primary' },
          { label: 'Total Responses', value: dashboardData.responseCount, color: 'accent' },
          {
            label: 'Avg Resolution',
            value: `${dashboardData.avgResolutionTime?.toFixed(1)}h`,
            color: 'purple',
          },
          { label: 'Active Users', value: dashboardData.activeUsers, color: 'yellow' },
        ].map((stat, i) => (
          <div
            key={i}
            className="card p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className="text-sm font-medium text-surface-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="section-title mb-4">Category Distribution</h2>
          <Doughnut data={categoryData} />
        </div>
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="section-title mb-4">Query vs Response Trend</h2>
          <Line data={timeSeriesData} />
        </div>
      </div>

      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="section-title mb-4">Category Usage</h2>
        <Bar data={categoryData} />
      </div>
    </div>
  );
}

export default Analytics;
