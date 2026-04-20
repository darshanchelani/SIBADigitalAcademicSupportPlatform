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
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-surface-600 hover:text-surface-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to sign in
        </Link>

        <div className="card p-8 md:p-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="eyebrow">Email sent</span>
                <h2 className="font-serif text-2xl font-semibold text-surface-900 mt-1 mb-2">Check your inbox</h2>
                <p className="text-surface-700">
                  If an account exists for{' '}
                  <span className="font-medium text-surface-900">{email}</span>, a reset link is on its way.
                </p>
                <p className="text-sm text-surface-500 mt-2">The link expires in 1 hour.</p>
              </div>
              <Link
                to="/login"
                className="inline-block mt-2 text-primary-800 hover:text-primary-900 font-medium underline underline-offset-2"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <img src="/sukkur-iba-logo.png" alt="" aria-hidden="true" className="w-12 h-12 mb-5" />
                <span className="eyebrow">Password reset</span>
                <h1 className="font-serif text-3xl font-semibold text-surface-900 mt-2">
                  Forgot your password?
                </h1>
                <p className="text-sm text-surface-600 mt-2">
                  Enter your email and we'll send you a link to reset it.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-800 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-modern"
                    placeholder="you@iba-suk.edu.pk"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Sending…' : 'Send reset link'}
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
