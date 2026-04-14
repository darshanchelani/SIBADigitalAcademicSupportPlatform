import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('If the email exists, a reset link has been sent');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
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
          Back to Login
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
            <h1 className="text-2xl font-bold text-white mb-1">Forgot Password</h1>
            <p className="text-surface-400 text-sm">We'll send you a reset link</p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-accent-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-surface-300">
                If an account with that email exists, we've sent a password reset link to{' '}
                <span className="text-primary-400 font-medium">{email}</span>
              </p>
              <p className="text-sm text-surface-500">
                Please check your email. The link will expire in 1 hour.
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-surface-400 text-center text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-surface-300 mb-1.5"
                  >
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

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
