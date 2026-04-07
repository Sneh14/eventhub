'use client';
import Link from 'next/link';
import { useEvents }    from '@/lib/hooks/useEvents';
import EventCard, { EventCardSkeleton } from '@/components/events/EventCard';
import Button  from '@/components/ui/Button';

// ── Featured events grid ──────────────────────────────────────────────────────
function FeaturedEvents() {
  const { data, isLoading } = useEvents({ limit: 6 });
  const events = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event: any) => <EventCard key={event.id} event={event} />)}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center relative">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Discover &amp; Book<br />
            <span className="text-indigo-200">Amazing Events</span>
          </h1>
          <p className="text-indigo-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            From tech conferences to live concerts, sports events to cultural festivals —
            find experiences that inspire you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <span className="inline-flex items-center justify-center px-6 py-2.5 text-base font-semibold rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 transition-colors w-full sm:w-auto">
                Browse Events →
              </span>
            </Link>
            <Link href="/bookings">
              <Button size="lg" variant="ghost" className="border border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Events</h2>
            <p className="text-gray-500 mt-1">Hand-picked upcoming events just for you</p>
          </div>
          <Link href="/events" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm whitespace-nowrap">
            View all →
          </Link>
        </div>
        <FeaturedEvents />
      </section>

      {/* CTA banner */}
      <section className="bg-indigo-50 border-y border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Ready to experience something new?
          </h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Browse thousands of events across India. Book tickets in seconds.
          </p>
          <Link href="/events">
            <Button size="lg">Explore All Events</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
