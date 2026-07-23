import { useState } from 'react';
import MetricsPills from '../components/MetricsPills.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import Tabs from '../components/Tabs.jsx';
import ApprovalBanner from '../components/ApprovalBanner.jsx';
import BookingsTable from '../components/BookingsTable.jsx';
import Pagination from '../components/Pagination.jsx';
import { Icon } from '../components/icons.jsx';
import { useBookings } from '../hooks/useBookings.js';
import { useMetrics } from '../hooks/useMetrics.js';
import { useFilters } from '../context/FiltersContext.jsx';

/**
 * View composition only. All data comes from hooks; all shared state from the
 * FiltersContext. This component wires pieces together and holds no logic.
 */
export default function FinanceBookings({ canApprove, owners = [] }) {
  const { filters } = useFilters();
  const [metricsKey, setMetricsKey] = useState(0);

  const { items, pagination, loading, error, mutate } = useBookings();
  const { metrics, loading: metricsLoading } = useMetrics(metricsKey);

  // Refresh pills after any mutation (approve/reject/delete/restore).
  const wrappedMutate = Object.fromEntries(
    Object.entries(mutate).map(([k, fn]) => [
      k,
      (id) => fn(id).then(() => setMetricsKey((n) => n + 1)),
    ])
  );

  return (
    <div className="space-y-5">
      {/* Metrics + header actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <MetricsPills metrics={metrics} loading={metricsLoading} />
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            More Actions <Icon.Chevron width={16} height={16} className="text-gray-400" />
          </button>
          <button
            title="Calendar view"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <Icon.Calendar width={18} height={18} />
          </button>
        </div>
      </div>

      <FiltersBar owners={owners} />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 pt-4">
          <Tabs canApprove={canApprove} total={pagination?.total} />
        </div>

        {filters.tab === 'approval' && (
          <div className="px-5 pt-4">
            <ApprovalBanner />
          </div>
        )}

        <div className="mt-2">
          {error ? (
            <div className="p-8 text-center text-sm text-red-500">{error}</div>
          ) : (
            <BookingsTable
              items={items}
              loading={loading}
              tab={filters.tab}
              mutate={wrappedMutate}
            />
          )}
        </div>

        <div className="border-t border-gray-100">
          <Pagination pagination={pagination} />
        </div>
      </div>
    </div>
  );
}
