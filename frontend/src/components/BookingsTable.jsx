import { useFilters } from '../context/FiltersContext.jsx';
import { PaymentBadge, BookingBadge } from './StatusBadge.jsx';
import OwnerAvatars from './OwnerAvatars.jsx';
import ServiceCell from './ServiceCell.jsx';
import RowActions from './RowActions.jsx';
import { Icon } from './icons.jsx';
import { formatINR, formatDate } from '../utils/format.js';

function SortHeader({ field, children }) {
  const { filters, toggleSort } = useFilters();
  const active = filters.sortBy === field;
  return (
    <button
      onClick={() => toggleSort(field)}
      className={`inline-flex items-center gap-1.5 ${active ? 'text-brand' : ''}`}
    >
      {children}
      <Icon.Sort width={13} height={13} className={active ? 'text-brand' : 'text-gray-400'} />
    </button>
  );
}

export default function BookingsTable({ items, loading, tab, mutate }) {
  const showBookingStatus = tab === 'approval';

  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-[1000px] border-separate border-spacing-0">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Th>Booking ID</Th>
            <Th><span className="inline-flex items-center gap-1.5">Lead Pax <Icon.Swap width={13} height={13} className="text-gray-400" /></span></Th>
            <Th><SortHeader field="travelDate">Travel Date</SortHeader></Th>
            <Th className="text-center"><span className="inline-flex items-center gap-1.5">Service <Icon.Filter width={13} height={13} className="text-gray-400" /></span></Th>
            <Th><span className="inline-flex items-center gap-1.5">Payment Status <Icon.Swap width={13} height={13} className="text-gray-400" /></span></Th>
            <Th><SortHeader field="amount">Amount</SortHeader></Th>
            <Th className="text-center">Owner</Th>
            <Th className="text-center">Voucher</Th>
            <Th className="text-center">Tasks</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows />
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-16 text-center text-sm text-gray-400">
                No bookings match your filters.
              </td>
            </tr>
          ) : (
            items.map((b) => (
              <tr key={b._id} className="text-sm text-gray-700 hover:bg-gray-50/60">
                <Td className="font-semibold text-gray-800">{b.bookingId}</Td>
                <Td>{b.leadPax}</Td>
                <Td>{formatDate(b.travelDate)}</Td>
                <Td className="text-center"><ServiceCell service={b.service} /></Td>
                <Td>
                  <div className="flex flex-col gap-1">
                    <PaymentBadge status={b.paymentStatus} />
                    {showBookingStatus && <BookingBadge status={b.bookingStatus} />}
                  </div>
                </Td>
                <Td className="font-semibold text-gray-800">{formatINR(b.amount)}</Td>
                <Td className="text-center"><div className="flex justify-center"><OwnerAvatars owners={b.owners} /></div></Td>
                <Td className="text-center"><VoucherCell voucher={b.voucher} /></Td>
                <Td className="text-center"><TasksCell tasks={b.tasks} /></Td>
                <Td className="text-right"><RowActions booking={b} tab={tab} mutate={mutate} /></Td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }) {
  return <th className={`whitespace-nowrap border-b border-gray-200 px-4 py-3.5 first:pl-6 last:pr-6 ${className}`}>{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`whitespace-nowrap border-b border-gray-100 px-4 py-4 first:pl-6 last:pr-6 ${className}`}>{children}</td>;
}

function VoucherCell({ voucher }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-200">
      <span className="flex h-8 w-9 items-center justify-center text-brand"><Icon.Receipt width={16} height={16} /></span>
      <span className="flex h-8 w-7 items-center justify-center border-l border-gray-200 text-gray-400"><Icon.Chevron width={13} height={13} /></span>
    </div>
  );
}

function TasksCell({ tasks = [] }) {
  const count = tasks.length;
  if (count === 0) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400">
        <Icon.Plus width={16} height={16} />
      </span>
    );
  }
  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-brand">
      <Icon.Clipboard width={16} height={16} />
      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
        {count}
      </span>
    </span>
  );
}

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: 10 }).map((__, j) => (
        <td key={j} className="border-b border-gray-100 px-4 py-4 first:pl-6 last:pr-6">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  ));
}
