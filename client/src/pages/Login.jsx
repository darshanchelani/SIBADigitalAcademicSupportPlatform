import React from 'react';
import { useState } from 'react';
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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        {/* Back to home */}
        <Link
          to="/"
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
          Back to Home
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-1 ring-white/20">
              <img
                src="/sukkur-iba-logo.png"
                alt="Sukkur IBA University"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-surface-400 text-sm">Sign in to your SDASP account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-modern"
                placeholder="your@email.com"
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

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {needsVerification && (
            <div className="mt-5 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-fade-in">
              <p className="text-sm text-yellow-300 mb-2">
                Your email is not verified yet. Please check your inbox for the verification link.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="text-sm text-primary-400 hover:text-primary-300 font-medium disabled:opacity-50 transition-colors"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-surface-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
