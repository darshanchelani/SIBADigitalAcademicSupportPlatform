import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
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
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-surface-600 hover:text-surface-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to user sign in
        </Link>

        <div className="card p-8 md:p-10">
          <div className="mb-8">
            <img src="/sukkur-iba-logo.png" alt="" aria-hidden="true" className="w-12 h-12 mb-5" />
            <span className="eyebrow">Admin portal</span>
            <h1 className="font-serif text-3xl font-semibold text-surface-900 mt-2">
              Administrator sign in.
            </h1>
            <p className="text-sm text-surface-600 mt-2">Restricted to platform administrators.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-800 mb-1.5">
                Admin email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: '' }));
                }}
                required
                aria-invalid={!!fieldErrors.email}
                className={`input-modern ${fieldErrors.email ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                placeholder="admin@iba-suk.edu.pk"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  required
                  aria-invalid={!!fieldErrors.password}
                  className={`input-modern !pr-11 ${fieldErrors.password ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-800 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in…' : 'Sign in as admin'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600">
            Need an admin account?{' '}
            <Link to="/admin/register" className="text-primary-800 hover:text-primary-900 font-medium underline underline-offset-2">
              Register
            </Link>
          </p>

          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800 text-center">
              Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
