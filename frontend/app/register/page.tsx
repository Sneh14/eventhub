'use client';
import { useState } from 'react';
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

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [loading,  setLoading]  = useState(false);

  const PASSWORD_RULES = [
    { label: 'At least 8 characters',             test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter (A–Z)',         test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number (0–9)',                   test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$%^&*…)',  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const isStrongPassword = (p: string) => PASSWORD_RULES.every(r => r.test(p));

  const validate = () => {
    const e: { email?: string; password?: string; confirm?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password || !isStrongPassword(password)) e.password = 'Password does not meet the requirements below';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(email, password);
    } catch (err: any) {
      toast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Left: Marketing panel ─────────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 flex-col justify-between p-10 text-white">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
              RSA
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/80 uppercase">Rahul Shetty Academy</span>
          </div>
          <div className="w-10 h-0.5 bg-white/30 mb-10" />

          <h2 className="text-3xl font-bold leading-tight mb-3">
            Start Practising<br />Like a Pro QA<br />Engineer Today
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-10 max-w-xs">
            Create your free sandbox account and get instant access to a full-stack practice app with real APIs, auth flows, and booking scenarios.
          </p>

          {/* Feature list */}
          <ul className="space-y-4">
            {FEATURES.map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">{icon}</span>
                <span className="text-sm text-white/85 leading-snug">{text}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3">
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

            <a
              href={`${BASE_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              API Documentation (Swagger)
            </a>
          </div>
        </div>

        {/* Social proof */}
        <div>
          <div className="border-t border-white/20 pt-6">
            <p className="text-2xl font-bold">50,000+</p>
            <p className="text-white/60 text-xs mt-0.5">QA engineers trained worldwide</p>
          </div>
        </div>
      </div>

      {/* ── Right: Register form ───────────────────────────────── */}
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
              <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
              <p className="text-sm text-gray-500 mt-1">Get your own EventHub sandbox</p>
            </div>

            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  data-testid="register-email" id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  data-testid="register-password" id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, number & symbol"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {/* Password strength guidelines */}
                <ul className="mt-2 space-y-1" id="password-guidelines">
                  {PASSWORD_RULES.map(({ label, test }) => {
                    const passed = password.length > 0 && test(password);
                    return (
                      <li key={label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {passed
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" />
                          }
                        </svg>
                        {label}
                      </li>
                    );
                  })}
                </ul>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
              </div>

              <button
                data-testid="register-btn" id="register-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                Sign in
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
