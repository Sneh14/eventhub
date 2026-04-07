'use client';
import { useState, useEffect } from 'react';
import Input   from '@/components/ui/Input';
import Select  from '@/components/ui/Select';
import Button  from '@/components/ui/Button';
import { useCreateEvent, useUpdateEvent } from '@/lib/hooks/useEvents';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES = [
  { value: 'Conference', label: 'Conference' },
  { value: 'Concert',    label: 'Concert'    },
  { value: 'Sports',     label: 'Sports'     },
  { value: 'Workshop',   label: 'Workshop'   },
  { value: 'Festival',   label: 'Festival'   },
];

const EMPTY = {
  title: '', description: '', category: 'Conference',
  venue: '', city: '', eventDate: '', price: '', totalSeats: '', imageUrl: '',
};

/** Convert UTC ISO → value acceptable by <input type="datetime-local"> */
function toLocalDT(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function EventForm({ event = null, onSuccess }) {
  const isEditing = !!event;
  const toast     = useToast();

  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const { mutate: create, isPending: creating } = useCreateEvent();
  const { mutate: update, isPending: updating } = useUpdateEvent();
  const pending = creating || updating;

  // Pre-fill form when a selected event changes
  useEffect(() => {
    if (event) {
      setForm({
        title:       event.title       ?? '',
        description: event.description ?? '',
        category:    event.category    ?? 'Conference',
        venue:       event.venue       ?? '',
        city:        event.city        ?? '',
        eventDate:   toLocalDT(event.eventDate),
        price:       event.price?.toString()      ?? '',
        totalSeats:  event.totalSeats?.toString() ?? '',
        imageUrl:    event.imageUrl    ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [event]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title     = 'Title is required';
    if (!form.category)       e.category  = 'Category is required';
    if (!form.venue.trim())   e.venue     = 'Venue is required';
    if (!form.city.trim())    e.city      = 'City is required';
    if (!form.eventDate)      e.eventDate = 'Event date is required';
    else if (new Date(form.eventDate) <= new Date()) e.eventDate = 'Must be a future date';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Enter a valid price (≥ 0)';
    if (!form.totalSeats || Number(form.totalSeats) < 1) e.totalSeats = 'Must have at least 1 seat';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const payload = {
      ...form,
      price:      parseFloat(form.price),
      totalSeats: parseInt(form.totalSeats, 10),
      eventDate:  new Date(form.eventDate).toISOString(),
      imageUrl:   form.imageUrl.trim() || undefined,
    };

    if (isEditing) {
      update({ id: event.id, data: payload }, {
        onSuccess: () => { toast('Event updated!', 'success'); onSuccess?.(); },
        onError:   (err) => toast(err.message, 'error'),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast('Event created!', 'success'); setForm(EMPTY); onSuccess?.(); },
        onError:   (err) => toast(err.message, 'error'),
      });
    }
  };

  return (
    <form data-testid="admin-event-form" id="admin-event-form" onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          data-testid="event-title-input" id="event-title-input"
          label="Title" required
          value={form.title} onChange={set('title')} error={errors.title}
          placeholder="Event title"
          className="sm:col-span-2"
        />
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={set('description')}
            placeholder="Describe the event…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>
        <Select
          label="Category" required
          options={CATEGORIES}
          value={form.category} onChange={set('category')} error={errors.category}
        />
        <Input
          label="City" required
          value={form.city} onChange={set('city')} error={errors.city}
          placeholder="e.g. Bangalore"
        />
        <Input
          label="Venue" required
          value={form.venue} onChange={set('venue')} error={errors.venue}
          placeholder="Venue name & address"
          className="sm:col-span-2"
        />
        <Input
          label="Event Date & Time" required
          type="datetime-local"
          value={form.eventDate} onChange={set('eventDate')} error={errors.eventDate}
        />
        <Input
          label="Price ($)" required
          type="number" min="0" step="0.01"
          value={form.price} onChange={set('price')} error={errors.price}
          placeholder="0.00"
        />
        <Input
          label="Total Seats" required
          type="number" min="1"
          value={form.totalSeats} onChange={set('totalSeats')} error={errors.totalSeats}
          placeholder="e.g. 500"
        />
        <Input
          label="Image URL (optional)"
          type="url"
          value={form.imageUrl} onChange={set('imageUrl')}
          placeholder="https://…"
        />
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <Button data-testid="add-event-btn" id="add-event-btn" type="submit" loading={pending}>
          {isEditing ? '💾 Update Event' : '+ Add Event'}
        </Button>
        {isEditing && (
          <Button type="button" variant="ghost" onClick={() => onSuccess?.()}>
            Cancel edit
          </Button>
        )}
      </div>
    </form>
  );
}
