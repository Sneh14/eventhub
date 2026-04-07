'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../api/eventsApi';

// ── Queries ───────────────────────────────────────────────────────────────────

export function useEvents(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn:  () => eventsApi.getEvents(filters),
    staleTime: 30_000,
  });
}

export function useEvent(id: string | number | null | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn:  () => eventsApi.getEventById(id),
    enabled:  !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, { id: number; data: unknown }>({
    mutationFn: ({ id, data }: { id: number; data: unknown }) =>
      eventsApi.updateEvent(id, data),
    onSuccess: (_: unknown, { id }: { id: number; data: unknown }) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eventsApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
