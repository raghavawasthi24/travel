import { useFilters } from '../context/FiltersContext.jsx';

/**
 * Tab bar + Total badge + "Show Incomplete Bookings" toggle.
 * The "Waiting for Approval" tab is only rendered when `canApprove` is true.
 */
export default function Tabs({ canApprove, total }) {
  const { filters, set } = useFilters();

  const tabs = [
    { key: 'bookings', label: 'Bookings' },
    { key: 'deleted', label: 'Deleted' },
    ...(canApprove ? [{ key: 'approval', label: 'Waiting for Approval' }] : []),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-1">
      <div className="flex gap-6">
        {tabs.map((t) => {
          const active = filters.tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => set('tab', t.key)}
              className={`relative -mb-px border-b-2 px-1 py-3 text-sm font-medium transition
                ${active ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pb-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={filters.showIncomplete}
            onChange={(e) => set('showIncomplete', e.target.checked)}
          />
          <span className="relative h-5 w-9 rounded-full bg-gray-300 transition peer-checked:bg-brand">
            <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
          </span>
          Show Incomplete Bookings
        </label>
        <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Total {total ?? '—'}
        </span>
      </div>
    </div>
  );
}
