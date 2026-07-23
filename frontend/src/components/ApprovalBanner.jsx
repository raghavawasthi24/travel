import { useFilters } from '../context/FiltersContext.jsx';
import { Icon } from './icons.jsx';

const SUB = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STRIP = {
  pending: { text: 'Showing bookings that are Pending approval. Payment stays Pending until approved.', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { text: 'Showing Approved bookings. Standard actions are available.', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { text: 'Showing Rejected bookings. Payment stays Pending. You can resend for approval.', cls: 'bg-red-50 text-red-700 border-red-200' },
  all: { text: 'Showing all bookings awaiting or completed through the approval flow.', cls: 'bg-brand-soft text-brand border-violet-200' },
};

/** Sub-dropdown + status strip shown only on the "Waiting for Approval" tab. */
export default function ApprovalBanner() {
  const { filters, set } = useFilters();
  const strip = STRIP[filters.approvalStatus] || STRIP.all;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {SUB.map((s) => {
          const active = filters.approvalStatus === s.key;
          return (
            <button
              key={s.key}
              onClick={() => set('approvalStatus', s.key)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition
                ${active ? 'border-brand bg-brand text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${strip.cls}`}>
        <Icon.Filter width={16} height={16} />
        {strip.text}
      </div>
    </div>
  );
}
