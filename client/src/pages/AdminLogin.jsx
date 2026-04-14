import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      // Check if user is admin
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'Admin') {
        toast.success('Welcome, Admin!');
        navigate('/dashboard');
      } else {
        toast.error('Access denied. Admin access required.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      toast.error(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-950 to-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-red-500/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <Link
          to="/login"
          className="inline-flex items-center text-surface-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to User Login
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-1 ring-white/20">
              <img
                src="/sukkur-iba-logo.png"
                alt="Sukkur IBA University"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
            <p className="text-surface-400 text-sm">Administrator access only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-modern"
                placeholder="admin@sdasp.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-surface-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-modern"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-purple-500 text-white rounded-xl font-semibold hover:from-red-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-500/20"
            >
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-center text-sm text-surface-400">
              Need an admin account?{' '}
              <Link
                to="/admin/register"
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Register
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-300/70 text-center">
              Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
