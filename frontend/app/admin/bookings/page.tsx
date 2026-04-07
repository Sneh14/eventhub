'use client';
import { useState } from 'react';
import Badge         from '@/components/ui/Badge';
import Button        from '@/components/ui/Button';
import Spinner       from '@/components/ui/Spinner';
import EmptyState    from '@/components/ui/EmptyState';
import Pagination    from '@/components/ui/Pagination';
import Select        from '@/components/ui/Select';
import Modal         from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useBookings, useCancelBooking } from '@/lib/hooks/useBookings';
import { useToast } from '@/components/ui/Toast';

const STATUS_OPTIONS = [
  { value: '',          label: 'All Statuses' },
  { value: 'confirmed', label: 'Confirmed'    },
  { value: 'cancelled', label: 'Cancelled'    },
];

const fmt_date  = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmt_price = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ── Booking detail modal ──────────────────────────────────────────────────────
function BookingModal({ booking, onClose }: { booking: any; onClose: () => void }) {
  if (!booking) return null;
  return (
    <Modal isOpen={!!booking} onClose={onClose} title={`Booking — ${booking.bookingRef}`} maxWidth="max-w-md">
      <div className="space-y-3 text-sm">
        <Row label="Reference"><span className="font-mono font-bold text-indigo-600">{booking.bookingRef}</span></Row>
        <Row label="Status">
          <Badge variant={booking.status === 'confirmed' ? 'success' : 'danger'}>{booking.status}</Badge>
        </Row>
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Event</p>
          <Row label="Title">{booking.event?.title}</Row>
          <Row label="Date">{booking.event ? fmt_date(booking.event.eventDate) : '—'}</Row>
          <Row label="City">{booking.event?.city}</Row>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
          <Row label="Name">{booking.customerName}</Row>
          <Row label="Email">{booking.customerEmail}</Row>
          <Row label="Phone">{booking.customerPhone}</Row>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3">
          <Row label="Tickets">{booking.quantity}</Row>
          <Row label="Total">{fmt_price(booking.totalPrice)}</Row>
          <Row label="Booked on">{fmt_date(booking.createdAt)}</Row>
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-gray-900 text-right">{children}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const toast = useToast();

  const [status,     setStatus]     = useState('');
  const [page,       setPage]       = useState(1);
  const [viewBooking, setViewBooking] = useState<any>(null);
  const [cancelId,    setCancelId]   = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useBookings({
    status: status || undefined, page, limit: 15,
  });

  const bookings   = data?.data       ?? [];
  const pagination = data?.pagination;

  const { mutate: doCancel, isPending: cancelling } = useCancelBooking();

  const confirmCancel = () => {
    if (!cancelId) return;
    doCancel(cancelId, {
      onSuccess: () => { toast('Booking cancelled', 'success'); setCancelId(null); },
      onError:   (err: any) => { toast(err.message, 'error'); setCancelId(null); },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination ? `${pagination.total} total bookings` : ''}
          </p>
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatus(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        )}

        {isError && (
          <EmptyState
            title="Couldn't load bookings"
            description="Failed to reach the server. Please retry."
            action={<Button onClick={() => refetch()}>Retry</Button>}
          />
        )}

        {!isLoading && !isError && bookings.length === 0 && (
          <EmptyState title="No bookings found" description="There are no bookings matching your filters." />
        )}

        {!isLoading && !isError && bookings.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    {['Ref', 'Customer', 'Event', 'Qty', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {b.bookingRef}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900 whitespace-nowrap">{b.customerName}</p>
                        <p className="text-gray-400 text-xs">{b.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px] truncate text-gray-700">
                        {b.event?.title ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-gray-700">{b.quantity}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-gray-700">
                        {fmt_price(b.totalPrice)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={b.status === 'confirmed' ? 'success' : 'danger'}>{b.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{fmt_date(b.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setViewBooking(b)}>
                            View
                          </Button>
                          {b.status === 'confirmed' && (
                            <Button variant="danger" size="sm" onClick={() => setCancelId(b.id)}>
                              Cancel
                            </Button>
                          )}
                        </div>
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

      {/* Detail modal */}
      <BookingModal booking={viewBooking} onClose={() => setViewBooking(null)} />

      {/* Cancel confirm */}
      <ConfirmDialog
        isOpen={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={confirmCancel}
        isLoading={cancelling}
        title="Cancel this booking?"
        description="This will cancel the booking and restore the seats to the event. This cannot be undone."
        confirmLabel="Yes, cancel it"
      />
    </div>
  );
}
