import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function PwdToggle({ shown, onToggle }) {
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

function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', adminSecret: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.adminSecret) errors.adminSecret = 'Admin secret key is required';
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});

    setLoading(true);
    try {
      const response = await axios.post('/auth/admin/register', {
        name: formData.name, email: formData.email,
        password: formData.password, adminSecret: formData.adminSecret,
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
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-surface-600 hover:text-surface-900 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to admin sign in
        </Link>

        <div className="card p-8 md:p-10">
          <div className="mb-8">
            <img src="/sukkur-iba-logo.png" alt="" aria-hidden="true" className="w-12 h-12 mb-5" />
            <span className="eyebrow">Admin registration</span>
            <h1 className="font-serif text-3xl font-semibold text-surface-900 mt-2">
              Create an administrator account.
            </h1>
            <p className="text-sm text-surface-600 mt-2">Requires a valid admin secret key.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-800 mb-1.5">Full name</label>
              <input
                id="name" name="name" type="text" value={formData.name} onChange={handleChange}
                required autoComplete="name" aria-invalid={!!fieldErrors.name}
                className={`input-modern ${fieldErrors.name ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                placeholder="Admin name"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-800 mb-1.5">Admin email</label>
              <input
                id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                required autoComplete="email" aria-invalid={!!fieldErrors.email}
                className={`input-modern ${fieldErrors.email ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                placeholder="admin@iba-suk.edu.pk"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-800 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'}
                  value={formData.password} onChange={handleChange}
                  required minLength={6} autoComplete="new-password" aria-invalid={!!fieldErrors.password}
                  className={`input-modern !pr-11 ${fieldErrors.password ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                  placeholder="••••••••"
                />
                <PwdToggle shown={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-800 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword} onChange={handleChange}
                  required minLength={6} autoComplete="new-password" aria-invalid={!!fieldErrors.confirmPassword}
                  className={`input-modern !pr-11 ${fieldErrors.confirmPassword ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                  placeholder="••••••••"
                />
                <PwdToggle shown={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-700">{fieldErrors.confirmPassword}</p>}
            </div>

            <div>
              <label htmlFor="adminSecret" className="block text-sm font-medium text-surface-800 mb-1.5">Admin secret key</label>
              <div className="relative">
                <input
                  id="adminSecret" name="adminSecret" type={showSecret ? 'text' : 'password'}
                  value={formData.adminSecret} onChange={handleChange}
                  required aria-invalid={!!fieldErrors.adminSecret}
                  className={`input-modern !pr-11 ${fieldErrors.adminSecret ? '!border-red-600 focus:!ring-red-500/30' : ''}`}
                  placeholder="Enter admin secret key"
                />
                <PwdToggle shown={showSecret} onToggle={() => setShowSecret(!showSecret)} />
              </div>
              {fieldErrors.adminSecret ? (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.adminSecret}</p>
              ) : (
                <p className="mt-1.5 text-xs text-surface-500">Contact the system administrator for the secret key.</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account…' : 'Create admin account'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-sm">
            <p className="text-center text-surface-600">
              Already have an admin account?{' '}
              <Link to="/admin/login" className="text-primary-800 hover:text-primary-900 font-medium underline underline-offset-2">
                Sign in
              </Link>
            </p>
            <p className="text-center">
              <Link to="/register" className="text-surface-500 hover:text-surface-800 underline underline-offset-2">
                Back to user registration
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-800 text-center">
              Admin accounts have full system access. Use responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
