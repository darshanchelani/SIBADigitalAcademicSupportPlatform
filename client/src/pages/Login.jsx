import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
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
    setNeedsVerification(false);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else if (result.needsVerification) {
      setNeedsVerification(true);
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await axios.post('/auth/resend-verification', { email });
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-surface-600 hover:text-surface-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="card p-8 md:p-10">
          <div className="mb-8">
            <img
              src="/sukkur-iba-logo.png"
              alt=""
              aria-hidden="true"
              className="w-12 h-12 mb-5 rounded-full ring-1 ring-surface-200 mx-auto"
            />
            <span className="eyebrow">Sign in</span>
            <h1 className="font-serif text-3xl font-semibold text-surface-900 mt-2">Welcome back.</h1>
            <p className="text-sm text-surface-600 mt-2">
              Use your Sukkur IBA account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-800 mb-1.5">
                Email
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
                placeholder="you@iba-suk.edu.pk"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
              )}
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
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-800 hover:text-primary-900 underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in…</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {needsVerification && (
            <div className="mt-5 p-4 bg-accent-50 border border-accent-200 rounded-md">
              <p className="text-sm text-accent-800 mb-2">
                Your email isn't verified yet. Please check your inbox for the verification link.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="text-sm text-primary-800 hover:text-primary-900 font-medium disabled:opacity-50 underline underline-offset-2"
              >
                {resending ? 'Sending…' : 'Resend verification email'}
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-surface-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-800 hover:text-primary-900 font-medium underline underline-offset-2">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
