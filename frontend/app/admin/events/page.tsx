'use client';
import { useState } from 'react';
import EventForm from '@/components/events/EventForm';
import Badge     from '@/components/ui/Badge';
import Button    from '@/components/ui/Button';
import Spinner   from '@/components/ui/Spinner';
import EmptyState    from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination    from '@/components/ui/Pagination';
import { useEvents, useDeleteEvent } from '@/lib/hooks/useEvents';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/Toast';

const CATEGORY_VARIANT: Record<string, string> = {
  Conference: 'indigo', Concert: 'warning', Sports: 'success', Workshop: 'info', Festival: 'danger',
};

const fmt_date  = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmt_price = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function AdminEventsPage() {
  const toast        = useToast();
  const queryClient  = useQueryClient();

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [deletingId,    setDeletingId]    = useState<number | null>(null);
  const [page, setPage]                   = useState(1);

  const filters      = { page, limit: 10 };
  const { data, isLoading } = useEvents(filters);
  const events       = data?.data       ?? [];
  const pagination   = data?.pagination;

  const { mutate: doDelete, isPending: deleting } = useDeleteEvent();

  const handleEdit   = (event: any) => {
    setSelectedEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const clearEdit    = () => setSelectedEvent(null);

  // ── Optimistic delete ─────────────────────────────────────────────────────
  const confirmDelete = (id: number) => {
    // Immediately remove from cache
    const snapshot = queryClient.getQueryData(['events', filters]);
    queryClient.setQueryData(['events', filters], (old: any) => {
      if (!old) return old;
      return { ...old, data: old.data.filter((e: any) => e.id !== id) };
    });
    setDeletingId(null);

    doDelete(id, {
      onSuccess: () => toast('Event deleted', 'success'),
      onError:   (err: any) => {
        // Rollback
        queryClient.setQueryData(['events', filters], snapshot);
        toast(err.message, 'error');
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Top: form ──────────────────────────────────────────────────────── */}
      <section>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {selectedEvent ? '✏️ Edit Event' : '+ New Event'}
          </h2>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            You can add up to <strong className="mx-1">6 events</strong>. Once the limit is reached, your oldest event is automatically replaced when you add a new one.
          </div>
          <EventForm event={selectedEvent} onSuccess={clearEdit} />
        </div>
      </section>

      {/* ── Bottom: events table ────────────────────────────────────────────── */}
      <section>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">All Events</h2>
            {pagination && (
              <span className="text-sm text-gray-400">{pagination.total} total</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState title="No events yet" description="Create your first event using the form above." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      {['Title', 'Category', 'City', 'Date', 'Price', 'Seats', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {events.map((event: any) => (
                      <tr key={event.id} data-testid="event-table-row" id="event-table-row" className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-gray-900 max-w-[220px] truncate">
                          <span>{event.title}</span>
                          {event.isStatic && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={(CATEGORY_VARIANT[event.category] ?? 'default') as any}>
                            {event.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{event.city}</td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{fmt_date(event.eventDate)}</td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{fmt_price(event.price)}</td>
                        <td className="px-4 py-3.5">
                          <span className={`font-semibold ${
                            event.availableSeats === 0
                              ? 'text-red-600'
                              : event.availableSeats <= 10
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}>
                            {event.availableSeats}/{event.totalSeats}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {event.isStatic ? (
                            <span className="text-xs text-gray-400 italic">Read-only</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                data-testid="edit-event-btn" id="edit-event-btn"
                                variant="ghost" size="sm"
                                onClick={() => handleEdit(event)}
                              >
                                Edit
                              </Button>
                              <Button
                                data-testid="delete-event-btn" id="delete-event-btn"
                                variant="danger" size="sm"
                                onClick={() => setDeletingId(event.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Delete confirm ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && confirmDelete(deletingId)}
        isLoading={deleting}
        title="Delete this event?"
        description="This will permanently delete the event and all associated bookings. This cannot be undone."
        confirmLabel="Delete event"
      />
    </div>
  );
}
