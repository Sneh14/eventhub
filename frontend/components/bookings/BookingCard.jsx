'use client';
import { useState } from 'react';
import Link from 'next/link';
import Badge         from '@/components/ui/Badge';
import Button        from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useCancelBooking } from '@/lib/hooks/useBookings';
import { useToast }         from '@/components/ui/Toast';

const fmt_date  = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const fmt_price = (n)   => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-28" />
      </div>
    </div>
  );
}

export default function BookingCard({ booking }) {
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  const { mutate: cancel, isPending } = useCancelBooking();

  const handleCancel = () => {
    cancel(booking.id, {
      onSuccess: () => { toast('Booking cancelled successfully', 'success'); setConfirm(false); },
      onError:   (err) => { toast(err.message, 'error'); setConfirm(false); },
    });
  };

  return (
    <>
      <div data-testid="booking-card" id="booking-card" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Ref + status */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="booking-ref font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {booking.bookingRef}
              </span>
              <Badge variant={booking.status === 'confirmed' ? 'success' : 'danger'}>
                {booking.status}
              </Badge>
              <span data-testid="booking-id" id="booking-id" className="font-mono text-xs text-gray-400">
                #{booking.id}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 text-base truncate mb-1">
              {booking.event?.title ?? 'Event'}
            </h3>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>📅 {booking.event ? fmt_date(booking.event.eventDate) : '—'}</span>
              <span>🎫 {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
              {booking.event?.city && <span>📍 {booking.event.city}</span>}
              <span>🗓 Booked {fmt_date(booking.createdAt)}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-indigo-700">{fmt_price(booking.totalPrice)}</p>
            <p className="text-xs text-gray-400">total</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <Link href={`/bookings/${booking.id}`}>
            <Button variant="secondary" size="sm">View Details</Button>
          </Link>
          {booking.status === 'confirmed' && (
            <Button data-testid="cancel-booking-btn" id="cancel-booking-btn" variant="danger" size="sm" onClick={() => setConfirm(true)}>
              Cancel Booking
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleCancel}
        isLoading={isPending}
        title="Cancel this booking?"
        description={`This will cancel ${booking.bookingRef} and release ${booking.quantity} seat(s) back to the event. This action cannot be undone.`}
        confirmLabel="Yes, cancel it"
      />
    </>
  );
}
