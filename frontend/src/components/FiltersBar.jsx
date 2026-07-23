import { useFilters } from '../context/FiltersContext.jsx';
import { Icon } from './icons.jsx';

const BOOKING_TYPES = ['All Bookings', 'Flight', 'Accommodation', 'Transportation', 'Package'];

function DateRange({ label, startField, endField }) {
  const { filters, set } = useFilters();
  return (
    <div className="flex-1 min-w-[220px]">
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center rounded-lg border border-gray-200 bg-white px-2 focus-within:border-brand">
        <input
          type="date"
          value={filters[startField]}
          onChange={(e) => set(startField, e.target.value)}
          className="w-full bg-transparent px-1 py-2 text-sm text-gray-600 outline-none"
        />
        <span className="text-gray-300">→</span>
        <input
          type="date"
          value={filters[endField]}
          onChange={(e) => set(endField, e.target.value)}
          className="w-full bg-transparent px-1 py-2 text-sm text-gray-600 outline-none"
        />
      </div>
    </div>
  );
}

export default function FiltersBar({ owners = [] }) {
  const { filters, set, reset } = useFilters();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <DateRange label="Booking Date" startField="bookingDateStart" endField="bookingDateEnd" />
        <DateRange label="Travel Date" startField="travelDateStart" endField="travelDateEnd" />

        {/* Booking Owner */}
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Booking Owner</label>
          <div className="relative">
            <select
              value={filters.owner}
              onChange={(e) => set('owner', e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-brand"
            >
              <option value="">Search / Select Owners</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>{o.name}</option>
              ))}
            </select>
            <Icon.Chevron className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Booking Type */}
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Booking Type</label>
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => set('type', e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-brand"
            >
              {BOOKING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Icon.Chevron className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <label className="mb-1.5 block text-sm font-medium text-transparent">Search</label>
          <div className="relative">
            <input
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Search by ID / Lead Pax / Amount"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm outline-none focus:border-brand"
            />
            <Icon.Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={reset}
          title="Reset filters"
          className="mb-0.5 flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
        >
          <Icon.Refresh width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
