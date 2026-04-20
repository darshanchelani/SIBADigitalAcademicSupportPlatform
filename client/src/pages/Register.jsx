import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-800 transition-colors"
      tabIndex={-1}
      aria-label={shown ? 'Hide password' : 'Show password'}
    >
      {shown ? (
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
  );
}

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (!email.endsWith('@iba-suk.edu.pk')) return 'Only @iba-suk.edu.pk emails are allowed';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required';
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const result = await register(name, email, password);
    if (result.success) setRegistered(true);
    setLoading(false);
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="card p-8 md:p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="eyebrow">Almost there</span>
            <h2 className="font-serif text-2xl font-semibold text-surface-900 mt-2 mb-3">Check your email</h2>
            <p className="text-surface-700 mb-1">We've sent a verification link to</p>
            <p className="text-surface-900 font-medium mb-4">{email}</p>
            <p className="text-sm text-accent-800 mb-6">
              The link expires in 10 minutes. Verify to sign in.
            </p>
            <Link to="/login" className="btn-primary inline-flex">Go to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

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
            <img src="/sukkur-iba-logo.png" alt="" aria-hidden="true" className="w-12 h-12 mb-5 rounded-full ring-1 ring-surface-200 mx-auto" />
            <span className="eyebrow">Create an account</span>
            <h1 className="font-serif text-3xl font-semibold text-surface-900 mt-2">
              Join your cohort.
            </h1>
            <p className="text-sm text-surface-600 mt-2">Use your Sukkur IBA email to register.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-800 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: '' }));
                }}
                required
                aria-invalid={!!fieldErrors.name}
                className={`input-modern ${fieldErrors.name ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                placeholder="Your name"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
            </div>

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
                onBlur={() => {
                  const err = validateEmail(email);
                  if (err) setFieldErrors((prev) => ({ ...prev, email: err }));
                }}
                required
                aria-invalid={!!fieldErrors.email}
                className={`input-modern ${fieldErrors.email ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                placeholder="yourname@iba-suk.edu.pk"
              />
              {fieldErrors.email ? (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>
              ) : (
                <p className="mt-1.5 text-xs text-surface-500">Only @iba-suk.edu.pk emails are accepted.</p>
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  required
                  minLength={6}
                  aria-invalid={!!fieldErrors.password}
                  className={`input-modern !pr-11 ${fieldErrors.password ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                  placeholder="••••••••"
                />
                <PasswordToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-800 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  required
                  minLength={6}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  className={`input-modern !pr-11 ${fieldErrors.confirmPassword ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                  placeholder="••••••••"
                />
                <PasswordToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Creating account…</span>
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-800 hover:text-primary-900 font-medium underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
