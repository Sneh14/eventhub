import { BASE_URL } from '@/lib/api/client';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Rahul Shetty Academy</h3>
            <p className="text-xs leading-relaxed">
              India's leading QA automation training academy — empowering engineers to build real-world testing skills.
            </p>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Popular Courses</h3>
            <ul className="space-y-2 text-xs">
              {[
                'Selenium WebDriver with Java',
                'Playwright with JavaScript',
                'RestAssured API Testing',
                'Cypress End-to-End Testing',
                'Appium Mobile Testing',
              ].map((course) => (
                <li key={course}>
                  <a
                    href="https://rahulshettyacademy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {course}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hiring Platform */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">QA Job Hiring Platform</h3>
            <p className="text-xs leading-relaxed mb-3">
              Get hired faster — take skill assessments trusted by top QA employers worldwide.
            </p>
            <a
              href="https://techsmarthire.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              techsmarthire.com →
            </a>
          </div>

          {/* Practice App */}
          <div>
            <h3 className="text-white font-bold text-sm mb-3">EventHub Practice App</h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Browse Events',       href: '/events' },
                { label: 'My Bookings',         href: '/bookings' },
                { label: 'Manage Events',       href: '/admin/events' },
                { label: 'API Documentation',   href: `${BASE_URL}/docs`, external: true },
              ].map(({ label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Rahul Shetty Academy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://rahulshettyacademy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              rahulshettyacademy.com →
            </a>
            <a
              href="https://techsmarthire.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              techsmarthire.com →
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
