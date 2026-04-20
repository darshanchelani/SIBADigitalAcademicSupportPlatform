import React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }
    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await axios.post('/auth/verify-email', { token });
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message ||
          'Verification failed. The link may have expired (valid for 10 minutes only).'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card p-8 md:p-10 text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-700 border-t-transparent mx-auto mb-5" />
              <span className="eyebrow">Please wait</span>
              <h2 className="font-serif text-2xl font-semibold text-surface-900 mt-2">
                Verifying your email…
              </h2>
              <p className="text-sm text-surface-600 mt-2">This should only take a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="eyebrow">Verified</span>
              <h2 className="font-serif text-2xl font-semibold text-surface-900 mt-2 mb-2">Email verified</h2>
              <p className="text-surface-700 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-flex">Go to sign in</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="eyebrow text-red-700">Verification failed</span>
              <h2 className="font-serif text-2xl font-semibold text-surface-900 mt-2 mb-2">Something went wrong</h2>
              <p className="text-surface-700 mb-6">{message}</p>
              <div className="space-y-3">
                <Link to="/register" className="btn-primary w-full">Register again</Link>
                <Link to="/login" className="block text-sm text-primary-800 hover:text-primary-900 underline underline-offset-2">
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
