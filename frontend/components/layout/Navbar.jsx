'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { BASE_URL } from '@/lib/api/client';

function TicketIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen,  setAdminOpen]  = useState(false);
  const adminRef = useRef(null);

  const isActive = (path) =>
    pathname === path || (path !== '/' && pathname.startsWith(path + '/'));

  // Close admin dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (adminRef.current && !adminRef.current.contains(e.target)) {
        setAdminOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center
                            group-hover:bg-indigo-700 transition-colors shadow-sm">
              <TicketIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">EventHub</span>
          </Link>

          {/* ── Desktop nav ───────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/"         active={isActive('/')}         data-testid="nav-home" id="nav-home">Home</NavLink>
            <NavLink href="/events"   active={isActive('/events')}   data-testid="nav-events" id="nav-events">Events</NavLink>
            <NavLink href="/bookings" active={isActive('/bookings')} data-testid="nav-bookings" id="nav-bookings">My Bookings</NavLink>
            <a
              href={`${BASE_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              API Docs
            </a>

            {/* Admin dropdown */}
            <div className="relative" ref={adminRef}>
              <button
                onClick={() => setAdminOpen((o) => !o)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive('/admin')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                `}
              >
                Admin
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${adminOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {adminOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg
                                border border-gray-100 py-1.5 z-50 animate-fade-in">
                  <DropdownLink href="/admin/events"   onClick={() => setAdminOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Manage Events
                  </DropdownLink>
                  <DropdownLink href="/admin/bookings" onClick={() => setAdminOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Manage Bookings
                  </DropdownLink>
                </div>
              )}
            </div>

            {/* ── User info + logout ──────────────────────────────────── */}
            {user && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <span
                  data-testid="user-email-display" id="user-email-display"
                  className="text-xs text-gray-500 max-w-[120px] truncate"
                  title={user.email}
                >
                  {user.email}
                </span>
                <button
                  data-testid="logout-btn" id="logout-btn"
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* ── Hamburger ─────────────────────────────────────────────────── */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
          {[
            { href: '/',               label: 'Home' },
            { href: '/events',          label: 'Events' },
            { href: '/bookings',        label: 'My Bookings' },
            { href: '/admin/events',    label: 'Admin — Events' },
            { href: '/admin/bookings',  label: 'Admin — Bookings' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`
                block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname.startsWith(href)
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-700 hover:bg-gray-50'}
              `}
            >
              {label}
            </Link>
          ))}
          <a
            href={`${BASE_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            API Docs
          </a>
          {user && (
            <>
              <div className="px-3 py-2 text-xs text-gray-400 truncate" data-testid="user-email-display" id="user-email-display">
                {user.email}
              </div>
              <button
                data-testid="logout-btn" id="logout-btn"
                onClick={() => { setMobileOpen(false); logout(); }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children, ...props }) {
  return (
    <Link
      href={href}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? 'text-indigo-600 bg-indigo-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
      `}
      {...props}
    >
      {children}
    </Link>
  );
}

function DropdownLink({ href, onClick, children }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
    >
      {children}
    </Link>
  );
}
