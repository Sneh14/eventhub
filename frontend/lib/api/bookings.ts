import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Booking,
  CreateBookingPayload,
} from '@/types';

export const bookingsApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Booking>>(`/bookings?page=${page}&limit=${limit}`),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`),

  getByRef: (ref: string) =>
    apiClient.get<ApiResponse<Booking>>(`/bookings/ref/${ref}`),

  create: (payload: CreateBookingPayload) =>
    apiClient.post<ApiResponse<Booking>>('/bookings', payload),

  cancel: (id: number) =>
    apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {}),

  clearAll: () =>
    apiClient.delete<ApiResponse<null>>('/bookings'),
};
