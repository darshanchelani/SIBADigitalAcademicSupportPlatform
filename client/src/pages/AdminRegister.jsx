import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!formData.adminSecret) {
      toast.error('Admin secret key is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/admin/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        adminSecret: formData.adminSecret,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Admin account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-950 to-surface-900 relative overflow-hidden py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-red-500/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <Link
          to="/admin/login"
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
          Back to Admin Login
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
            <h1 className="text-2xl font-bold text-white mb-1">Admin Registration</h1>
            <p className="text-surface-400 text-sm">Create an administrator account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-modern"
                placeholder="Admin Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                Admin Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="input-modern"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-surface-300 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="input-modern"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label
                htmlFor="adminSecret"
                className="block text-sm font-medium text-surface-300 mb-1.5"
              >
                Admin Secret Key
              </label>
              <input
                id="adminSecret"
                name="adminSecret"
                type="password"
                value={formData.adminSecret}
                onChange={handleChange}
                required
                className="input-modern !border-red-500/30 focus:!border-red-400/50"
                placeholder="Enter admin secret key"
              />
              <p className="mt-1.5 text-xs text-surface-500">
                Contact system administrator for the secret key
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-purple-500 text-white rounded-xl font-semibold hover:from-red-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-500/20"
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-center text-sm text-surface-400">
              Already have an admin account?{' '}
              <Link
                to="/admin/login"
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="text-center text-sm text-surface-500">
              <Link
                to="/register"
                className="text-surface-500 hover:text-surface-300 transition-colors"
              >
                Back to User Registration
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-300/70 text-center">
              Admin accounts have full system access. Use responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
