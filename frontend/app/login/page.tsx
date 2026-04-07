'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { BASE_URL } from '@/lib/api/client';

const FEATURES = [
  { icon: '⚡', text: 'Live REST APIs — test real endpoints, not mocks' },
  { icon: '🔒', text: 'Isolated sandbox — your data, your tests, no conflicts' },
  { icon: '🎫', text: 'Auth, CRUD, bookings — flows you\'ll face on the job' },
  { icon: '🤖', text: 'Built for Selenium, Playwright, RestAssured & more' },
];

// Demo credentials used in sample tests — block these to nudge users to create their own
const DEMO_EMAILS = ['rahulshetty1@gmail.com', 'rahulshetty1@yahoo.com'];

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [errors,      setErrors]      = useState<{ email?: string; password?: string }>({});
  const [loading,     setLoading]     = useState(false);
  const [demoWarning, setDemoWarning] = useState(false);
  const [showLinks,   setShowLinks]   = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/config`)
      .then(r => r.json())
      .then(data => setShowLinks(data.showExploreLinks ?? false))
      .catch(() => {});
  }, []);

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoWarning(false);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      // If login fails and the email is a demo credential, show a helpful nudge instead
      if (DEMO_EMAILS.includes(email.trim().toLowerCase())) {
        setDemoWarning(true);
      } else {
        toast(err.message || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Left: Marketing panel ─────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex-col justify-between p-10 text-white overflow-y-auto">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
              RSA
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/80 uppercase">Rahul Shetty Academy</span>
          </div>

          {/* App preview screenshot — first, gives users a glimpse */}
          <div className="rounded-xl overflow-hidden border border-white/20 shadow-2xl mb-8">
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              <span className="ml-2 text-xs text-white/50 font-mono">eventhub.app</span>
            </div>
            <Image
              src="/app-preview.png"
              alt="EventHub app preview"
              width={800}
              height={500}
              className="w-full object-cover object-top"
              priority
            />
          </div>

          <div className="w-10 h-0.5 bg-white/30 mb-6" />

          {/* Feature list */}
          <ul className="space-y-4">
            {FEATURES.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">{icon}</span>
                <span className="text-sm text-white/85 leading-snug">{text}</span>
              </li>
            ))}
          </ul>

          {/* CTAs — shown only when backend flag is on */}
          {showLinks && (
          <div className="mt-8">
            <div className="flex flex-col gap-3">
                <a
                  href="https://rahulshettyacademy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-amber-400 hover:bg-amber-300 transition-colors px-4 py-2.5 rounded-lg w-fit"
                >
                  Explore all courses at RahulShettyAcademy.com
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>

                <a
                  href="https://techsmarthire.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-violet-500 hover:bg-violet-400 transition-colors px-4 py-2.5 rounded-lg w-fit"
                >
                  Explore Skill Assessments — QA Job Hiring Platform
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
            </div>
          </div>
          )}
        </div>

        {/* Social proof */}
        <div>
          <div className="border-t border-white/20 pt-6 mt-8">
            <p className="text-2xl font-bold">50,000+</p>
            <p className="text-white/60 text-xs mt-0.5">QA engineers trained worldwide</p>
          </div>
        </div>
      </div>

      {/* ── Right: Login form ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-12">

        {/* Mobile-only brand bar */}
        <div className="md:hidden text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <span>RSA</span>
            <span className="text-white/70">·</span>
            <span>QA Practice Hub</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">EventHub — Practice App</h2>
        </div>

        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              The #1 QA Practice Hub<br />for Automation Engineers
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              EventHub is a production-grade practice app designed so you can sharpen your testing skills on real-world scenarios — before your next interview or project.
            </p>
          </div>

          <a
            href={`${BASE_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            API Documentation (Swagger)
          </a>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sign in to EventHub</h1>
              <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              {demoWarning && (
                <div className="rounded-lg bg-amber-50 border border-amber-300 px-4 py-3 text-sm text-amber-800 leading-relaxed">
                  <p className="font-semibold mb-1">⚠️ Looks like you're using sample test credentials!</p>
                  <p>
                    Looks like you are directly running tests without changing credentials.{' '}
                    <Link href="/register" className="font-semibold underline hover:text-amber-900">
                      Sign up now
                    </Link>{' '}
                    to create your own login credentials, update them in the test &amp; run again. Good luck! 🚀
                  </p>
                </div>
              )}

              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="login-submit-btn w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-600 hover:underline font-medium">
                Register
              </Link>
            </p>
          </div>

          {/* Below-form trust nudge */}
          <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
            A practice environment by{' '}
            <a href="https://rahulshettyacademy.com" target="_blank" rel="noopener noreferrer"
              className="text-indigo-500 hover:underline font-medium">
              RahulShettyAcademy.com
            </a>
            {' '}— used by QA engineers worldwide to master automation testing.
          </p>

        </div>
      </div>
    </div>
  );
}