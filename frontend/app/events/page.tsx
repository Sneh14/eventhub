'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import EventCard, { EventCardSkeleton } from '@/components/events/EventCard';
import EventFilters from '@/components/events/EventFilters';
import EmptyState   from '@/components/ui/EmptyState';
import Pagination   from '@/components/ui/Pagination';
import Spinner      from '@/components/ui/Spinner';
import Button       from '@/components/ui/Button';
import { useEvents }  from '@/lib/hooks/useEvents';

// ── Inner component that reads searchParams ────────────────────────────────────
function EventsContent() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const filters = {
    search:   searchParams.get('search')   || undefined,
    category: searchParams.get('category') || undefined,
    city:     searchParams.get('city')     || undefined,
    page:     Number(searchParams.get('page') || 1),
    limit:    12,
  };

  const { data, isLoading, isError, refetch } = useEvents(filters);
  const events     = data?.data       ?? [];
  const pagination = data?.pagination;

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => <EventCardSkeleton key={i} />)}
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <EmptyState
        title="Couldn't load events"
        description="There was a problem connecting to the server. Please try again."
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description="Try adjusting your filters or search terms to find what you're looking for."
        icon={
          <svg className="w-16 h-16 mx-auto text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
    );
  }

  return (
    <>
      {events.length > 5 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Your sandbox holds up to <strong className="mx-1">9 bookings</strong> and you can create up to <strong className="mx-1">6 custom events</strong>. When either limit is reached, the oldest entry is automatically replaced.
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {events.map((event: any) => <EventCard key={event.id} event={event} />)}
      </div>
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onChange={changePage}
        />
      )}
    </>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
export default function EventsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="text-gray-500 mt-1">Find your next unforgettable experience</p>
      </div>

      {/* Filters need Suspense because they call useSearchParams */}
      <Suspense fallback={<div className="h-20 flex items-center"><Spinner /></div>}>
        <EventFilters />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        }
      >
        <EventsContent />
      </Suspense>

      {/* Add New Event CTA */}
      <div className="mt-12 flex justify-center">
        <Link href="/admin/events">
          <Button size="lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Event
          </Button>
        </Link>
      </div>
    </div>
  );
}
