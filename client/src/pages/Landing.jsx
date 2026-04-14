import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Landing() {
  const navigate = useNavigate();
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLogoLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-4000"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 animate-fade-in-down">
        <div className="flex items-center space-x-3">
          <div
            className={`relative transition-all duration-700 ease-out ${logoLoaded ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12'}`}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-glow overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
              <img
                src="/sukkur-iba-logo.png"
                alt="Sukkur IBA University"
                className="w-10 h-10 object-contain drop-shadow-lg"
              />
            </div>
            {/* Animated ring around logo */}
            <div className="absolute -inset-1 rounded-xl border-2 border-primary-400/40 animate-pulse-soft pointer-events-none"></div>
          </div>
          <div
            className={`transition-all duration-500 delay-300 ${logoLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          >
            <span className="text-xl font-bold text-white">SDASP</span>
            <p className="text-[10px] text-primary-300/80 -mt-1 tracking-wide">
              Sukkur IBA University
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/login')}
            className="px-4 py-2 text-surface-400 hover:text-white text-sm font-medium transition-colors duration-200"
          >
            Admin Portal
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 text-white/90 hover:text-white border border-white/20 rounded-xl text-sm font-medium hover:bg-white/10 transition-all duration-200"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-500 shadow-lg shadow-primary-600/25 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8 animate-fade-in-up">
            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-surface-300 font-medium">
              Sukkur IBA University — Quality, Excellence, Merit
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-white">Your Academic</span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-accent-400 bg-clip-text text-transparent">
              Support Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Post queries, get AI-powered responses, collaborate with peers, and earn recognition.
            Everything you need for academic success, in one place.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            <button
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-lg font-semibold rounded-2xl shadow-xl shadow-primary-600/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span className="flex items-center space-x-2">
                <span>Start for Free</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 text-white/90 border border-white/20 rounded-2xl text-lg font-semibold hover:bg-white/5 hover:border-white/30 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              title: 'Smart Queries',
              desc: 'Post text, voice, or video queries. AI-powered moderation ensures quality responses.',
              color: 'from-primary-500 to-primary-600',
              delay: '0.4s',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ),
              title: 'Peer Collaboration',
              desc: 'Learn together. Share knowledge with peers and get expert moderator guidance.',
              color: 'from-accent-500 to-accent-600',
              delay: '0.5s',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              ),
              title: 'Earn & Compete',
              desc: 'Gain points, unlock badges, and climb the leaderboard as you contribute.',
              color: 'from-purple-500 to-purple-600',
              delay: '0.6s',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: feature.delay }}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-surface-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-12 mt-16 animate-fade-in-up"
          style={{ animationDelay: '0.7s' }}
        >
          {[
            { value: '3', label: 'Categories (MRC, PRC, ERC)' },
            { value: 'AI', label: 'Powered Draft Responses' },
            { value: 'PWA', label: 'Installable on Any Device' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-white/10 bg-surface-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & About */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/sukkur-iba-logo.png"
                  alt="Sukkur IBA"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="text-lg font-bold text-white">SDASP</span>
                  <p className="text-[10px] text-surface-400 -mt-0.5">Sukkur IBA University</p>
                </div>
              </div>
              <p className="text-sm text-surface-400 leading-relaxed">
                Student Digital Academic Support Platform — empowering students with AI-powered
                academic assistance.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2">
                {['Smart Queries', 'Knowledge Base', 'Peer Collaboration', 'Gamification'].map(
                  (item) => (
                    <li key={item}>
                      <span className="text-sm text-surface-400 hover:text-white transition-colors cursor-pointer">
                        {item}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* University */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                University
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.iba-suk.edu.pk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Official Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.iba-suk.edu.pk/home/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <span className="text-sm text-surface-400">Nisar Ahmed Siddiqui Road</span>
                </li>
                <li>
                  <span className="text-sm text-surface-400">Sukkur, Sindh, Pakistan</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Get in Touch
              </h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-primary-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-surface-400">info@iba-suk.edu.pk</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-primary-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-sm text-surface-400">071-5644000</span>
                </li>
              </ul>
              {/* Social Links */}
              <div className="flex space-x-3 mt-4">
                {[
                  {
                    href: 'https://www.facebook.com/SukkurIBA.University/',
                    label: 'Facebook',
                    icon: (
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    ),
                  },
                  {
                    href: 'https://twitter.com/sukkur_iba',
                    label: 'Twitter',
                    icon: (
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    ),
                  },
                  {
                    href: 'https://www.linkedin.com/company/sukkur-iba',
                    label: 'LinkedIn',
                    icon: (
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                    ),
                  },
                ].map(({ href, label, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-surface-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      {icon}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-surface-500">
              &copy; {new Date().getFullYear()} Sukkur IBA University. All rights reserved.
            </p>
            <p className="text-xs text-surface-500">Quality &bull; Excellence &bull; Merit</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
