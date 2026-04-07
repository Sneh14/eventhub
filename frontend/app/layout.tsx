import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers  from '@/lib/providers';
import AppShell   from '@/components/layout/AppShell';
import AuthGuard  from '@/components/auth/AuthGuard';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title:       'EventHub — Discover & Book Events',
  description: 'Find and book tickets for the best events near you.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased min-h-screen`}>
        <Providers>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
