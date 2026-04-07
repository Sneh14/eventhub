import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Event,
  CreateEventPayload,
  UpdateEventPayload,
  EventFilters,
} from '@/types';

// Build query string from filters
function buildQuery(filters?: EventFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const eventsApi = {
  getAll: (filters?: EventFilters) =>
    apiClient.get<PaginatedResponse<Event>>(`/events${buildQuery(filters)}`),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Event>>(`/events/${id}`),

  create: (payload: CreateEventPayload) =>
    apiClient.post<ApiResponse<Event>>('/events', payload),

  update: (id: number, payload: UpdateEventPayload) =>
    apiClient.put<ApiResponse<Event>>(`/events/${id}`, payload),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/events/${id}`),
};
