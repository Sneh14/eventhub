'use client';
import Link from 'next/link';
import Image from 'next/image';
import Badge from '@/components/ui/Badge';

const CATEGORY_VARIANT = {
  Conference: 'indigo',
  Concert:    'warning',
  Sports:     'success',
  Workshop:   'info',
  Festival:   'danger',
};

function fmt_date(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function fmt_price(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n);
}

function SeatsIndicator({ available }) {
  if (available === 0)
    return <span className="text-xs font-bold text-red-600">SOLD OUT</span>;
  if (available <= 10)
    return <span className="text-xs font-bold text-amber-600">{available} seat{available > 1 ? 's' : ''} left!</span>;
  return <span className="text-xs font-semibold text-emerald-600">{available} seats available</span>;
}

// Skeleton — export so pages can reuse it
export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export default function EventCard({ event }) {
  const soldOut = event.availableSeats === 0;

  return (
    <article data-testid="event-card" id="event-card" className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200 overflow-hidden shrink-0">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-indigo-200">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant={CATEGORY_VARIANT[event.category] ?? 'default'}>{event.category}</Badge>
        </div>
        {event.isStatic && (
          <div className="absolute top-3 right-3">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Featured</span>
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-gray-900 text-[15px] line-clamp-2 hover:text-indigo-600 transition-colors mb-2 leading-snug">
            {event.title}
          </h3>
        </Link>

        <div className="space-y-1.5 mb-4 flex-1">
          <Row icon="calendar">{fmt_date(event.eventDate)}</Row>
          <Row icon="location">{event.venue}, {event.city}</Row>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-lg font-bold text-indigo-700">{fmt_price(event.price)}</p>
            <SeatsIndicator available={event.availableSeats} />
          </div>
          <Link
            href={`/events/${event.id}`}
            aria-disabled={soldOut}
            data-testid="book-now-btn" id="book-now-btn"
            className={`
              px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${soldOut
                ? 'bg-gray-100 text-gray-400 pointer-events-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}
            `}
          >
            {soldOut ? 'Sold Out' : 'Book Now'}
          </Link>
        </div>
      </div>
    </article>
  );
}

function Row({ icon, children }) {
  const paths = {
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  };
  return (
    <div className="flex items-start gap-1.5 text-sm text-gray-500">
      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[icon]} />
      </svg>
      <span className="line-clamp-1">{children}</span>
    </div>
  );
}
