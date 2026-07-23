import { http } from './api.js';

/**
 * Domain service: the only place that knows the finance endpoint shapes.
 * Hooks/components call these methods, never fetch directly (Dependency
 * Inversion — the UI depends on this abstraction).
 */
export const bookingService = {
  list: (query) => http.get('/api/finance/bookings', query),
  metrics: (query) => http.get('/api/finance/bookings/metrics', query),
  owners: () => http.get('/api/finance/owners'),
  updateStatus: (id, action) =>
    http.patch(`/api/finance/bookings/${id}/status`, { action }),
  remove: (id) => http.del(`/api/finance/bookings/${id}`),
  restore: (id) => http.post(`/api/finance/bookings/${id}/restore`),
};
