'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookingsApi';

// ── Queries ───────────────────────────────────────────────────────────────────

export function useBookings(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn:  () => bookingsApi.getBookings(filters),
  });
}

export function useBooking(id: string | number | null | undefined) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn:  () => bookingsApi.getBookingById(id),
    enabled:  !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => bookingsApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bookingsApi.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
