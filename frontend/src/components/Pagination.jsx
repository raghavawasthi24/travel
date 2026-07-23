import { useFilters } from '../context/FiltersContext.jsx';
import { Icon } from './icons.jsx';

const ROWS_OPTIONS = [6, 10, 20, 50, 100];

/** Builds a compact page list like: 1 2 3 … 8 */
function pageList(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, 2, 3, totalPages, current]);
  const out = [];
  let prev = 0;
  for (const p of [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({ pagination }) {
  const { filters, set, setPage } = useFilters();
  if (!pagination) return null;

  const { page, totalPages, showing } = pagination;
  const pages = pageList(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Rows per page:</span>
        <div className="relative">
          <select
            value={filters.limit}
            onChange={(e) => set('limit', Number(e.target.value))}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm outline-none focus:border-brand"
          >
            {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <Icon.Chevron className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" width={14} height={14} />
        </div>
      </div>

      <p className="text-sm text-gray-500">{showing}</p>

      <div className="flex items-center gap-1">
        <PagerBtn disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <Icon.Chevron className="rotate-90" width={16} height={16} />
        </PagerBtn>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium
                ${p === page ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {p}
            </button>
          )
        )}
        <PagerBtn disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          <Icon.Chevron className="-rotate-90" width={16} height={16} />
        </PagerBtn>
      </div>
    </div>
  );
}

function PagerBtn({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
