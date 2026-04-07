import apiClient from './client';

// Each function returns the raw API response body: { success, data, pagination? }

export const eventsApi = {
  /** GET /events?category=&city=&search=&page=&limit= */
  getEvents: (params = {}) =>
    apiClient.get('/events', { params }),

  /** GET /events/:id */
  getEventById: (id) =>
    apiClient.get(`/events/${id}`),

  /** POST /events */
  createEvent: (data) =>
    apiClient.post('/events', data),

  /** PUT /events/:id */
  updateEvent: (id, data) =>
    apiClient.put(`/events/${id}`, data),

  /** DELETE /events/:id */
  deleteEvent: (id) =>
    apiClient.delete(`/events/${id}`),
};
