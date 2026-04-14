import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-400 border-t-transparent mx-auto mb-5"></div>
              <h2 className="text-xl font-semibold text-white">Verifying your email...</h2>
              <p className="text-surface-400 text-sm mt-2">Please wait a moment</p>
            </>
          )}

          {status === 'success' && (
            <div className="animate-scale-in">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
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
              <h2 className="text-xl font-bold text-accent-400 mb-2">Email Verified!</h2>
              <p className="text-surface-300 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-block">
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-scale-in">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-2">Verification Failed</h2>
              <p className="text-surface-300 mb-6">{message}</p>
              <div className="space-y-3">
                <Link to="/register" className="btn-primary block">
                  Register Again
                </Link>
                <Link
                  to="/login"
                  className="block text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
