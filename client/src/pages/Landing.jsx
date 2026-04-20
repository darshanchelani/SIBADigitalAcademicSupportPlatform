import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [counters, setCounters] = useState({ programs: 0, students: 0, faculty: 0, years: 0 });

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

  const animateCounters = () => {
    const targets = { programs: 40, students: 5000, faculty: 200, years: 30 };
    const duration = 1400;
    const steps = 40;
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
      title: 'Smart Queries',
      desc: 'Post questions in text, voice, or video. Every submission runs through a moderation pipeline with optional AI-assisted drafts.',
    },
    {
      title: 'Peer Collaboration',
      desc: 'Answer classmates, share notes, earn recognition. Moderator responses carry authority; peer replies build community.',
    },
    {
      title: 'Earn & Compete',
      desc: 'Points for every contribution, badges for milestones, and a leaderboard that actually reflects sustained effort.',
    },
    {
      title: 'Knowledge Base',
      desc: 'Every resolved thread becomes searchable. The longer the platform runs, the more valuable it gets.',
    },
  ];

  const setRef = (id) => (el) => { sectionRefs.current[id] = el; };
  const revealClass = (id) =>
    visibleSections[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

  return (
    <div className="min-h-screen bg-surface-50 text-surface-800 flex flex-col">
      <header className="border-b border-surface-200/70">
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/sukkur-iba-logo.png"
              alt=""
              aria-hidden="true"
              className="w-9 h-9 object-contain"
            />
            <div className="leading-tight">
              <p className="font-serif text-lg font-semibold text-surface-900">SIBA</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-surface-500">
                Academic Support
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => navigate('/admin/login')}
              className="btn-ghost hidden sm:inline-flex"
            >
              Admin
            </button>
            <button onClick={() => navigate('/login')} className="btn-ghost">
              Sign in
            </button>
            <button onClick={() => navigate('/register')} className="btn-primary">
              Get started
            </button>
          </nav>
        </div>
      </header>

      <section className="max-w-6xl mx-auto w-full px-6 md:px-10 pt-20 pb-24 grid md:grid-cols-12 gap-12 items-end">
        <div className="md:col-span-7">
          <span className="eyebrow">Sukkur IBA University · Est. 1994</span>
          <h1 className="font-serif font-semibold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-surface-900 mt-5">
            A quieter place <br />
            to ask, answer, <br />
            <em className="font-serif italic text-primary-800">and learn together.</em>
          </h1>
          <p className="mt-7 text-lg text-surface-700 max-w-xl leading-relaxed">
            SIBA Academic Support is the official query and knowledge platform for Sukkur IBA
            students. Post questions in any format, get moderated answers, and build a shared
            knowledge base your whole cohort can draw from.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button onClick={() => navigate('/register')} className="btn-primary px-6 py-3 text-base">
              Create an account
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary px-6 py-3 text-base">
              I already have one
            </button>
          </div>
          <p className="mt-5 text-sm text-surface-500">
            Open to any student with an&nbsp;
            <span className="font-medium text-surface-700">@iba-suk.edu.pk</span> email.
          </p>
        </div>

        <aside className="md:col-span-5">
          <div className="card p-6 md:p-7">
            <p className="eyebrow">What's inside</p>
            <ul className="mt-4 space-y-4">
              {features.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0"
                  />
                  <div>
                    <p className="font-serif text-base font-semibold text-surface-900">
                      {f.title}
                    </p>
                    <p className="text-sm text-surface-600 leading-relaxed">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section
        id="stats-section"
        ref={setRef('stats-section')}
        className={`border-y border-surface-200/70 bg-white transition-all duration-500 ${revealClass(
          'stats-section'
        )}`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
          <div className="max-w-2xl">
            <span className="eyebrow">The university</span>
            <h2 className="section-title mt-3">
              A thirty-year institution, now with a shared digital memory.
            </h2>
            <p className="prose-muted mt-4">
              Sukkur IBA University has awarded merit-based admissions since 1994. This platform
              gives every cohort a place to record what they learn — so the next one doesn't have
              to start from zero.
            </p>
          </div>

          <dl className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Programs offered', value: counters.programs, suffix: '+' },
              { label: 'Enrolled students', value: counters.students, suffix: '+' },
              { label: 'Faculty members', value: counters.faculty, suffix: '+' },
              { label: 'Years of excellence', value: counters.years, suffix: '' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-surface-500">{s.label}</dt>
                <dd className="font-serif text-4xl md:text-5xl font-semibold text-surface-900 mt-1 tabular-nums">
                  {s.value}
                  {s.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="howit-section"
        ref={setRef('howit-section')}
        className={`py-20 transition-all duration-500 ${revealClass('howit-section')}`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2 className="section-title mt-3">Four steps. Nothing more.</h2>
          </div>

          <ol className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-surface-200/70">
            {[
              { step: '01', title: 'Register', desc: 'Sign up with your university email.' },
              { step: '02', title: 'Ask', desc: 'Post queries in text, voice, or video.' },
              { step: '03', title: 'Receive', desc: 'Get moderated and peer responses.' },
              { step: '04', title: 'Contribute', desc: 'Answer others, earn points, rise up.' },
            ].map((item) => (
              <li key={item.step} className="py-6 md:py-0 md:px-6 first:md:pl-0">
                <p className="font-serif italic text-accent-700 text-sm">{item.step}</p>
                <h3 className="font-serif text-xl font-semibold text-surface-900 mt-2">
                  {item.title}
                </h3>
                <p className="text-sm text-surface-600 mt-2 leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="cta-section"
        ref={setRef('cta-section')}
        className={`border-t border-surface-200/70 bg-white py-20 transition-all duration-500 ${revealClass(
          'cta-section'
        )}`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-10 items-center">
          <div className="overflow-hidden rounded-xl border border-surface-200">
            <iframe
              title="Sukkur IBA University Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3570.982!2d68.8574!3d27.7052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39437430c6f13a29%3A0xd1c6f76626a07b89!2sSukkur%20IBA%20University!5e0!3m2!1sen!2spk!4v1700000000000!5m2!1sen!2spk"
              width="100%"
              height="340"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div>
            <span className="eyebrow">Ready when you are</span>
            <h2 className="section-title mt-3">Join your cohort on the platform.</h2>
            <p className="prose-muted mt-4 max-w-md">
              The platform is free for all Sukkur IBA students and runs entirely on your university
              email — no additional signup, no external accounts.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => navigate('/register')} className="btn-primary px-6 py-3 text-base">
                Create a free account
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary px-6 py-3 text-base">
                Sign in
              </button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-surface-600">
              {['Free for all students', 'AI-assisted drafts', 'Works offline (PWA)'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-700" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-surface-200/70 bg-surface-50">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/sukkur-iba-logo.png" alt="" aria-hidden="true" className="w-9 h-9" />
              <div>
                <p className="font-serif font-semibold text-surface-900">SIBA Academic Support</p>
                <p className="text-xs text-surface-500">Sukkur IBA University</p>
              </div>
            </div>
            <p className="text-sm text-surface-600 leading-relaxed">
              A digital space for student queries, peer collaboration, and a growing institutional
              knowledge base.
            </p>
          </div>

          <div>
            <h4 className="eyebrow mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-surface-600">
              {['Smart Queries', 'Knowledge Base', 'Peer Collaboration', 'Gamification'].map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-3">University</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.iba-suk.edu.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-surface-700 hover:text-primary-800 underline-offset-2 hover:underline"
                >
                  Official website
                </a>
              </li>
              <li>
                <a
                  href="https://www.iba-suk.edu.pk/home/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-surface-700 hover:text-primary-800 underline-offset-2 hover:underline"
                >
                  Contact
                </a>
              </li>
              <li className="text-surface-600">Nisar Ahmed Siddiqui Road</li>
              <li className="text-surface-600">Sukkur, Sindh, Pakistan</li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-3">Get in touch</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:registrar@iba-suk.edu.pk" className="text-surface-700 hover:text-primary-800">
                  registrar@iba-suk.edu.pk
                </a>
              </li>
              <li>
                <a href="tel:+92719220261" className="text-surface-700 hover:text-primary-800">
                  +92-71-9220261
                </a>
              </li>
              <li>
                <a href="tel:+92719220262" className="text-surface-700 hover:text-primary-800">
                  +92-71-9220262
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-200/70">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-surface-500">
            <p>&copy; {new Date().getFullYear()} Sukkur IBA University. All rights reserved.</p>
            <p className="italic font-serif">Quality · Excellence · Merit</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
