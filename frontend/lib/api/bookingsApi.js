import apiClient from './client';

export const bookingsApi = {
  /** GET /bookings?eventId=&status=&page=&limit= */
  getBookings: (params = {}) =>
    apiClient.get('/bookings', { params }),

  /** GET /bookings/:id */
  getBookingById: (id) =>
    apiClient.get(`/bookings/${id}`),

  /** GET /bookings/ref/:ref */
  getBookingByRef: (ref) =>
    apiClient.get(`/bookings/ref/${ref}`),

  /** POST /bookings */
  createBooking: (data) =>
    apiClient.post('/bookings', data),

  /** DELETE /bookings/:id (cancel) */
  cancelBooking: (id) =>
    apiClient.delete(`/bookings/${id}`),
};
