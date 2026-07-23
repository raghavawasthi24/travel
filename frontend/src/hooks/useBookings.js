import { useCallback, useEffect, useState } from 'react';
import { bookingService } from '../services/bookingService.js';
import { useFilters } from '../context/FiltersContext.jsx';

/**
 * Owns list-fetching state (loading/error/data) derived from the current
 * filters. Re-fetches whenever a relevant filter changes. Exposes `refetch`
 * and mutation helpers so components stay presentation-only.
 */
export function useBookings() {
  const { filters } = useFilters();
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = {
    tab: filters.tab,
    approvalStatus: filters.approvalStatus,
    bookingDateStart: filters.bookingDateStart,
    bookingDateEnd: filters.bookingDateEnd,
    travelDateStart: filters.travelDateStart,
    travelDateEnd: filters.travelDateEnd,
    owner: filters.owner,
    type: filters.type,
    search: filters.search,
    showIncomplete: filters.showIncomplete,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
  };
  const key = JSON.stringify(query);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.list(query);
      setData({ items: res.items, pagination: res.pagination });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Debounce so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(fetchData, filters.search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchData, filters.search]);

  const mutate = {
    approve: (id) => bookingService.updateStatus(id, 'approve').then(fetchData),
    reject: (id) => bookingService.updateStatus(id, 'reject').then(fetchData),
    resubmit: (id) => bookingService.updateStatus(id, 'resubmit').then(fetchData),
    remove: (id) => bookingService.remove(id).then(fetchData),
    restore: (id) => bookingService.restore(id).then(fetchData),
  };

  return { ...data, loading, error, refetch: fetchData, mutate };
}
