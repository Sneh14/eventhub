// ─── Event ────────────────────────────────────────────────────────────────────

export interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string; // ISO string from API
  price: number;
  totalSeats: number;
  availableSeats: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  price: number;
  totalSeats: number;
  imageUrl?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: number;
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  bookingRef: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
}

export interface CreateBookingPayload {
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}
