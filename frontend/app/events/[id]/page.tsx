'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link   from 'next/link';
import Image  from 'next/image';
import Badge  from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input  from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useEvent }         from '@/lib/hooks/useEvents';
import { useCreateBooking } from '@/lib/hooks/useBookings';
import { useToast }         from '@/components/ui/Toast';

const CATEGORY_VARIANT: Record<string, string> = {
  Conference: 'indigo', Concert: 'warning', Sports: 'success', Workshop: 'info', Festival: 'danger',
};

const fmt_date  = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
const fmt_time  = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const fmt_price = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// ── Booking confirmation card ─────────────────────────────────────────────────
function BookingConfirmation({ booking }: { booking: any }) {
  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Booking Confirmed! 🎉</h3>
      <p className="text-gray-500 text-sm mb-5">Your tickets are reserved.</p>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5 text-left space-y-2">
        <Row label="Booking Ref">
          <span className="booking-ref font-mono font-bold text-indigo-600">{booking.data?.bookingRef}</span>
        </Row>
        <Row label="Customer">{booking.data?.customerName}</Row>
        <Row label="Tickets">{booking.data?.quantity}</Row>
        <Row label="Total">{fmt_price(booking.data?.totalPrice)}</Row>
      </div>

      <div className="flex flex-col gap-2">
        <Link href="/bookings">
          <Button className="w-full">View My Bookings</Button>
        </Link>
        <Link href="/events">
          <Button variant="ghost" className="w-full">Browse More Events</Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{children}</span>
    </div>
  );
}

// ── Booking form ──────────────────────────────────────────────────────────────
function BookingForm({ event }: { event: any }) {
  const toast = useToast();
  const { mutate: createBooking, isPending } = useCreateBooking();

  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '', quantity: 1,
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<any>(null);

  if (confirmed) return <BookingConfirmation booking={confirmed} />;

  const maxQty   = Math.min(10, event.availableSeats);
  const total    = parseFloat(event.price) * form.quantity;
  const soldOut  = event.availableSeats === 0;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim() || form.customerName.length < 2) e.customerName = 'Name must be at least 2 chars';
    if (!form.customerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.customerEmail = 'Enter a valid email';
    if (!form.customerPhone.trim() || form.customerPhone.replace(/\D/g, '').length < 10) e.customerPhone = 'Enter a valid 10-digit phone';
    if (form.quantity < 1 || form.quantity > maxQty) e.quantity = `Quantity must be 1–${maxQty}`;
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    createBooking(
      { ...form, eventId: event.id, quantity: Number(form.quantity) },
      {
        onSuccess: (res) => setConfirmed(res),
        onError:   (err: any) => toast(err.message, 'error'),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {/* Quantity */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Tickets</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
            className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-40"
            disabled={form.quantity <= 1}
          >−</button>
          <span id="ticket-count" className="ticket-count w-8 text-center font-semibold text-lg">{form.quantity}</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, quantity: Math.min(maxQty, f.quantity + 1) }))}
            className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-40"
            disabled={form.quantity >= maxQty}
          >+</button>
          <span className="text-sm text-gray-400">(max {maxQty})</span>
        </div>
        {errors.quantity && <p className="text-xs text-red-600">{errors.quantity}</p>}
      </div>

      <Input id="customerName"  name="customerName"  label="Full Name"    required value={form.customerName}  onChange={set('customerName')}  error={errors.customerName}  placeholder="Your full name" />
      <Input data-testid="customer-email" id="customer-email" name="customerEmail" label="Email"        required type="email" value={form.customerEmail} onChange={set('customerEmail')} error={errors.customerEmail} placeholder="you@email.com" />
      <Input id="phone"         name="phone"         label="Phone Number" required type="tel"   value={form.customerPhone} onChange={set('customerPhone')} error={errors.customerPhone} placeholder="+91 98765 43210" />

      {/* Price summary */}
      <div className="bg-indigo-50 rounded-xl p-4 space-y-1.5 text-sm border border-indigo-100">
        <div className="flex justify-between text-gray-600">
          <span>{fmt_price(event.price)} × {form.quantity} ticket{form.quantity > 1 ? 's' : ''}</span>
          <span>{fmt_price(total)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-indigo-200">
          <span>Total</span>
          <span className="text-indigo-700">{fmt_price(total)}</span>
        </div>
      </div>

      <Button id="confirm-booking" type="submit" loading={isPending} className="confirm-booking-btn w-full" size="lg" disabled={soldOut}>
        {soldOut ? 'Sold Out' : 'Confirm Booking'}
      </Button>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function EventDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const { data, isLoading, isError } = useEvent(id);
  const event   = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          title="Event not found"
          description="The event you're looking for doesn't exist or has been removed."
          action={<Link href="/events"><Button>Browse Events</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/events" className="hover:text-indigo-600 transition-colors">Events</Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{event.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: event details ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
            {event.imageUrl ? (
              <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-indigo-200">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title + badge */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant={(CATEGORY_VARIANT[event.category] ?? 'default') as any}>
                {event.category}
              </Badge>
              {event.isStatic && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            {event.isStatic && (
              <div className="mb-4 flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This is a featured event — always available for practice
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <MetaItem icon="📅" label="Date">{fmt_date(event.eventDate)}</MetaItem>
              <MetaItem icon="🕐" label="Time">{fmt_time(event.eventDate)}</MetaItem>
              <MetaItem icon="📍" label="Venue">{event.venue}</MetaItem>
              <MetaItem icon="🌆" label="City">{event.city}</MetaItem>
              <MetaItem icon="🎫" label="Available">
                <span className={event.availableSeats === 0 ? 'text-red-600 font-bold' : event.availableSeats <= 10 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                  {event.availableSeats === 0 ? 'SOLD OUT' : `${event.availableSeats} / ${event.totalSeats} seats`}
                </span>
              </MetaItem>
              <MetaItem icon="💰" label="Price per ticket">{fmt_price(event.price)}</MetaItem>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About this event</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: sticky booking panel ─────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Book Tickets</h2>
              <span className="text-2xl font-bold text-indigo-700">{fmt_price(event.price)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">per ticket</p>
            <BookingForm event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3.5">
      <span className="text-lg shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{children}</p>
      </div>
    </div>
  );
}
