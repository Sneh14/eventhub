'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Badge         from '@/components/ui/Badge';
import Button        from '@/components/ui/Button';
import Spinner       from '@/components/ui/Spinner';
import EmptyState    from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useBooking }      from '@/lib/hooks/useBookings';
import { useCancelBooking } from '@/lib/hooks/useBookings';
import { useToast }         from '@/components/ui/Toast';
import { useRouter }        from 'next/navigation';

const fmt_date  = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmt_price = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ── Refund Eligibility ────────────────────────────────────────────────────────
function RefundEligibility({ quantity }: { quantity: number }) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'eligible' | 'ineligible'>('idle');

  const check = () => {
    setStatus('checking');
    setTimeout(() => {
      setStatus(quantity === 1 ? 'eligible' : 'ineligible');
    }, 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Refund</h2>

      {status === 'idle' && (
        <button
          data-testid="check-refund-btn" id="check-refund-btn"
          onClick={check}
          className="text-sm text-indigo-600 hover:underline"
        >
          Check eligibility for refund?
        </button>
      )}

      {status === 'checking' && (
        <div data-testid="refund-spinner" id="refund-spinner" className="flex items-center gap-3 text-sm text-gray-500">
          <Spinner size="sm" />
          <span>Checking your refund eligibility…</span>
        </div>
      )}

      {status === 'eligible' && (
        <div data-testid="refund-result" id="refund-result" className="flex items-start gap-2.5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span><strong>Eligible for refund.</strong> Single-ticket bookings qualify for a full refund.</span>
        </div>
      )}

      {status === 'ineligible' && (
        <div data-testid="refund-result" id="refund-result" className="flex items-start gap-2.5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span><strong>Not eligible for refund.</strong> Group bookings ({quantity} tickets) are non-refundable.</span>
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{children}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const toast    = useToast();
  const [confirm, setConfirm] = useState(false);

  const { data, isLoading, isError, error } = useBooking(id);
  const booking = data?.data;
  const { mutate: cancel, isPending } = useCancelBooking();

  const handleCancel = () => {
    cancel(booking.id, {
      onSuccess: () => {
        toast('Booking cancelled successfully', 'success');
        router.push('/bookings');
      },
      onError: (err: any) => {
        toast(err.message, 'error');
        setConfirm(false);
      },
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (isError) {
    const is403 = (error as any)?.status === 403;
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          title={is403 ? 'Access Denied' : 'Booking not found'}
          description={is403 ? 'You are not authorized to view this booking.' : "This booking doesn't exist or may have been cancelled."}
          action={<Link href="/bookings"><Button>View My Bookings</Button></Link>}
        />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          title="Booking not found"
          description="This booking doesn't exist or may have been cancelled."
          action={<Link href="/bookings"><Button>View My Bookings</Button></Link>}
        />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/bookings" className="hover:text-indigo-600">My Bookings</Link>
          <span>/</span>
          <span className="text-gray-900 font-mono">{booking.bookingRef}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">
                {booking.bookingRef}
              </span>
              <Badge variant={booking.status === 'confirmed' ? 'success' : 'danger'}>
                {booking.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{booking.event?.title ?? 'Event Booking'}</h1>
          </div>
          {booking.status === 'confirmed' && (
            <Button variant="danger" onClick={() => setConfirm(true)}>Cancel Booking</Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Event info */}
          <DetailSection title="Event Details">
            <Field label="Event">{booking.event?.title}</Field>
            <Field label="Category">{booking.event?.category}</Field>
            <Field label="Date">{booking.event ? fmt_date(booking.event.eventDate) : '—'}</Field>
            <Field label="Venue">{booking.event?.venue}</Field>
            <Field label="City">{booking.event?.city}</Field>
          </DetailSection>

          {/* Customer */}
          <DetailSection title="Customer Details">
            <Field label="Name">{booking.customerName}</Field>
            <Field label="Email">{booking.customerEmail}</Field>
            <Field label="Phone">{booking.customerPhone}</Field>
          </DetailSection>

          {/* Payment summary */}
          <DetailSection title="Payment Summary">
            <Field label="Tickets">{booking.quantity}</Field>
            <Field label="Price per ticket">{booking.event ? fmt_price(parseFloat(booking.event.price)) : '—'}</Field>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Total Paid</span>
              <span className="text-lg font-bold text-indigo-700">{fmt_price(booking.totalPrice)}</span>
            </div>
          </DetailSection>

          {/* Refund eligibility */}
          <RefundEligibility quantity={booking.quantity} />

          {/* Metadata */}
          <DetailSection title="Booking Information">
            <Field label="Booked on">{fmt_date(booking.createdAt)}</Field>
            <Field label="Booking ID">#{booking.id}</Field>
          </DetailSection>
        </div>

        <div className="mt-6">
          <Link href="/bookings">
            <Button variant="secondary">← Back to My Bookings</Button>
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleCancel}
        isLoading={isPending}
        title="Cancel this booking?"
        description={`Cancelling ${booking.bookingRef} will release ${booking.quantity} seat(s) back to the event. This cannot be undone.`}
        confirmLabel="Yes, cancel it"
      />
    </>
  );
}
