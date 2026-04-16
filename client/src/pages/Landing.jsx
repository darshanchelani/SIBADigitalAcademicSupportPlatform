import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

function Landing() {
  const navigate = useNavigate();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const [activeFeature, setActiveFeature] = useState(0);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [counters, setCounters] = useState({ programs: 0, students: 0, faculty: 0, years: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setLogoLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
            if (entry.target.id === 'stats-section' && !statsAnimated) {
              setStatsAnimated(true);
              animateCounters();
            }
          }
        });
      },
      { threshold: 0.2 }
    );
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [statsAnimated]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const animateCounters = () => {
    const targets = { programs: 40, students: 5000, faculty: 200, years: 30 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounters({
        programs: Math.round(targets.programs * eased),
        students: Math.round(targets.students * eased),
        faculty: Math.round(targets.faculty * eased),
        years: Math.round(targets.years * eased),
      });
      if (step >= steps) clearInterval(interval);
    }, stepTime);
  };

  const features = [
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
      desc: 'Post text, voice, or video queries with AI-powered moderation for quality responses.',
      color: 'from-primary-500 to-primary-600',
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
      desc: 'Learn together, share knowledge with peers, and get expert moderator guidance.',
      color: 'from-accent-500 to-accent-600',
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
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: 'Knowledge Base',
      desc: 'Search through resolved queries and build a growing academic knowledge repository.',
      color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl animate-float animation-delay-4000"></div>
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
            <div className="absolute -inset-1 rounded-xl border-2 border-primary-400/40 animate-pulse-soft pointer-events-none"></div>
          </div>
          <div
            className={`transition-all duration-500 delay-300 ${logoLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          >
            <span className="text-lg font-bold text-white leading-tight">
              SIBA Digital Academic
            </span>
            <p className="text-[10px] text-primary-300/80 -mt-0.5 tracking-wide">
              Support Platform
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
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-20">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8 animate-fade-in-up">
            <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-surface-300 font-medium">
              Sukkur IBA University — Quality, Excellence, Merit
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-white">SIBA Digital Academic</span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-accent-400 bg-clip-text text-transparent">
              Support Platform
            </span>
          </h1>

          <p
            className="text-lg md:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            Post queries, get AI-powered responses, collaborate with peers, and earn recognition.
            Everything you need for academic success, in one place.
          </p>

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
      </div>

      {/* ====== SECTION 1: Platform Features (Interactive) ====== */}
      <section
        id="features-section"
        ref={(el) => (sectionRefs.current['features-section'] = el)}
        className="relative z-10 py-20 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div
            className={`text-center mb-14 transition-all duration-700 ${visibleSections['features-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Academic Success
              </span>
            </h2>
            <p className="text-surface-400 mt-4 max-w-xl mx-auto">
              Our platform combines AI technology with peer collaboration to create the ultimate
              academic support experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Feature Navigation */}
            <div
              className={`space-y-3 transition-all duration-700 delay-200 ${visibleSections['features-section'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            >
              {features.map((feature, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${activeFeature === i ? 'bg-white/10 border-primary-500/50 shadow-lg shadow-primary-500/10' : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'}`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 ${activeFeature === i ? 'scale-110' : 'group-hover:scale-105'}`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-bold mb-1 transition-colors ${activeFeature === i ? 'text-white' : 'text-surface-300'}`}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed transition-colors ${activeFeature === i ? 'text-surface-300' : 'text-surface-500'}`}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                  {activeFeature === i && (
                    <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-400 to-accent-400 rounded-full animate-progress-bar"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Feature Visual */}
            <div
              className={`transition-all duration-700 delay-300 ${visibleSections['features-section'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10 space-y-4">
                  {activeFeature === 0 && (
                    <div className="animate-fade-in-up">
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10 mb-3">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            Q
                          </div>
                          <div className="text-white text-sm font-medium">
                            How do I implement binary search?
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                            Text
                          </span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            Voice
                          </span>
                          <span className="px-2 py-1 bg-accent-500/20 text-accent-300 rounded text-xs">
                            Video
                          </span>
                        </div>
                      </div>
                      <div className="bg-accent-500/10 rounded-xl p-4 border border-accent-500/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="w-4 h-4 text-accent-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span className="text-accent-300 text-xs font-semibold">
                            AI Moderated
                          </span>
                        </div>
                        <p className="text-surface-300 text-sm">
                          Query automatically checked for quality and categorized.
                        </p>
                      </div>
                    </div>
                  )}
                  {activeFeature === 1 && (
                    <div className="animate-fade-in-up">
                      <div className="space-y-3">
                        {['Ali Ahmed', 'Darshan Chelani', 'You'].map((name, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-3 bg-white/10 rounded-xl p-3 border border-white/10"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${i === 0 ? 'bg-primary-500' : i === 1 ? 'bg-purple-500' : 'bg-accent-500'}`}
                            >
                              {name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{name}</p>
                              <p className="text-surface-400 text-xs">
                                {i === 2 ? 'Typing...' : 'Shared an answer'}
                              </p>
                            </div>
                            {i !== 2 && (
                              <span className="px-2 py-0.5 bg-accent-500/20 text-accent-300 rounded text-[10px] font-semibold">
                                +5 pts
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeFeature === 2 && (
                    <div className="animate-fade-in-up">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="text-center mb-4">
                        <p className="text-2xl font-bold text-white">850 Points</p>
                        <p className="text-surface-400 text-sm">Top 5% Contributor</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        {['Scholar', 'Helper', 'Expert'].map((badge) => (
                          <span
                            key={badge}
                            className="px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-lg text-xs font-semibold border border-yellow-500/30"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeFeature === 3 && (
                    <div className="animate-fade-in-up">
                      <div className="bg-white/10 rounded-xl p-4 border border-white/10 mb-3">
                        <div className="flex items-center space-x-2 mb-3">
                          <svg
                            className="w-5 h-5 text-primary-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <div className="flex-1 h-8 bg-white/10 rounded-lg flex items-center px-3">
                            <span className="text-surface-400 text-sm">
                              Search resolved queries...
                            </span>
                          </div>
                        </div>
                        {['Data Structures', 'OOP Concepts', 'Database Design'].map((topic, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg mb-2"
                          >
                            <span className="text-surface-300 text-sm">{topic}</span>
                            <span className="text-primary-400 text-xs font-medium">
                              {12 - i * 3} results
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== SECTION 2: About Sukkur IBA University ====== */}
      <section
        id="stats-section"
        ref={(el) => (sectionRefs.current['stats-section'] = el)}
        className="relative z-10 py-20 bg-gradient-to-b from-transparent via-primary-950/50 to-transparent"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div
            className={`text-center mb-14 transition-all duration-700 ${visibleSections['stats-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="text-accent-400 text-sm font-semibold uppercase tracking-widest">
              Our University
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3">
              Sukkur IBA University at a{' '}
              <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                Glance
              </span>
            </h2>
            <p className="text-surface-400 mt-4 max-w-xl mx-auto">
              A premier institution committed to quality education, merit-based admissions, and
              producing industry-ready graduates since 1994.
            </p>
          </div>

          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-14 transition-all duration-700 delay-200 ${visibleSections['stats-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {[
              { value: counters.programs, suffix: '+', label: 'Programs Offered', icon: '📚' },
              { value: counters.students, suffix: '+', label: 'Enrolled Students', icon: '🎓' },
              { value: counters.faculty, suffix: '+', label: 'Faculty Members', icon: '👨‍🏫' },
              { value: counters.years, suffix: '+', label: 'Years of Excellence', icon: '🏛️' },
            ].map((stat, i) => (
              <div
                key={i}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="text-sm text-surface-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 delay-300 ${visibleSections['stats-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {[
              {
                title: 'Merit-Based Admissions',
                desc: 'Transparent and fair admission process ensuring equal opportunity for all students across Pakistan.',
                icon: '⚖️',
              },
              {
                title: 'Industry Partnerships',
                desc: 'Strong links with national and international organizations for internships and placements.',
                icon: '🤝',
              },
              {
                title: 'Research & Innovation',
                desc: 'Focus on cutting-edge research in engineering, management, and computer science fields.',
                icon: '🔬',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SECTION 3: How It Works + Google Map ====== */}
      <section
        id="howit-section"
        ref={(el) => (sectionRefs.current['howit-section'] = el)}
        className="relative z-10 py-20 border-t border-white/5"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div
            className={`text-center mb-14 transition-all duration-700 ${visibleSections['howit-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">
              Get Started
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3">
              How It{' '}
              <span className="bg-gradient-to-r from-purple-400 to-primary-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 transition-all duration-700 delay-200 ${visibleSections['howit-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {[
              {
                step: '01',
                title: 'Register',
                desc: 'Create your free account with university email',
                color: 'from-primary-500 to-primary-600',
              },
              {
                step: '02',
                title: 'Post Query',
                desc: 'Ask questions via text, voice, or video',
                color: 'from-accent-500 to-accent-600',
              },
              {
                step: '03',
                title: 'Get Answers',
                desc: 'Receive peer and moderator responses',
                color: 'from-purple-500 to-purple-600',
              },
              {
                step: '04',
                title: 'Earn Points',
                desc: 'Gain rewards and climb the leaderboard',
                color: 'from-amber-500 to-amber-600',
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 h-full">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-white font-bold mb-1">{item.title}</h3>
                  <p className="text-surface-400 text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-surface-600 z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center transition-all duration-700 delay-300 ${visibleSections['howit-section'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                title="Sukkur IBA University Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3570.982!2d68.8574!3d27.7052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39437430c6f13a29%3A0xd1c6f76626a07b89!2sSukkur%20IBA%20University!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
            <div className="bg-gradient-to-br from-primary-600/20 to-accent-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-extrabold text-white mb-3">Ready to Get Started?</h3>
              <p className="text-surface-300 mb-6 leading-relaxed">
                Join thousands of Sukkur IBA students already using the platform. Register now and
                start collaborating with your peers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 text-white/90 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
              <div className="flex items-center gap-4 mt-6 text-sm text-surface-400">
                {['Free forever', 'AI-Powered', 'PWA Ready'].map((text) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-accent-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="relative z-10 mt-auto border-t border-white/10 bg-surface-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/sukkur-iba-logo.png"
                  alt="Sukkur IBA"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="text-lg font-bold text-white leading-tight">SIBA Digital</span>
                  <p className="text-[10px] text-surface-400 -mt-0.5">Academic Support Platform</p>
                </div>
              </div>
              <p className="text-sm text-surface-400 leading-relaxed">
                Empowering Sukkur IBA University students with AI-powered academic assistance, peer
                collaboration, and gamified learning.
              </p>
            </div>

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
                    className="text-sm text-surface-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Official Website
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.iba-suk.edu.pk/home/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-surface-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
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

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Get in Touch
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:registrar@iba-suk.edu.pk"
                    className="flex items-center space-x-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                      <svg
                        className="w-4 h-4 text-primary-400"
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
                    </div>
                    <span className="text-sm text-surface-400 group-hover:text-white transition-colors">
                      registrar@iba-suk.edu.pk
                    </span>
                  </a>
                </li>
                <li>
                  <a href="tel:+92719220261" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center group-hover:bg-accent-500/30 transition-colors">
                      <svg
                        className="w-4 h-4 text-accent-400"
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
                    </div>
                    <span className="text-sm text-surface-400 group-hover:text-white transition-colors">
                      +92-71-9220261
                    </span>
                  </a>
                </li>
                <li>
                  <a href="tel:+92719220262" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <svg
                        className="w-4 h-4 text-purple-400"
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
                    </div>
                    <span className="text-sm text-surface-400 group-hover:text-white transition-colors">
                      +92-71-9220262
                    </span>
                  </a>
                </li>
              </ul>
              <div className="flex space-x-3 mt-5">
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
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-surface-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
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
