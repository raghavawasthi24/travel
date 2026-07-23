import { useEffect, useState } from 'react';
import { bookingService } from '../services/bookingService.js';
import { useFilters } from '../context/FiltersContext.jsx';

/**
 * Fetches the Net / You Give / You Get placeholders. The pills honour the same
 * date/owner/type filters as the table (but not the search box or tab).
 */
export function useMetrics(refreshKey = 0) {
  const { filters } = useFilters();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const query = {
    bookingDateStart: filters.bookingDateStart,
    bookingDateEnd: filters.bookingDateEnd,
    travelDateStart: filters.travelDateStart,
    travelDateEnd: filters.travelDateEnd,
    owner: filters.owner,
    type: filters.type,
  };
  const key = JSON.stringify(query) + ':' + refreshKey;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    bookingService
      .metrics(query)
      .then((res) => alive && setMetrics(res.metrics))
      .catch(() => alive && setMetrics(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { metrics, loading };
}
