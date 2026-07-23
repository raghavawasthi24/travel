import { Icon } from './icons.jsx';

const NAV = [
  { label: 'Dashboard', icon: Icon.Home },
  { label: 'Sales', icon: Icon.Swap, chevron: true },
  { label: 'Operations', icon: Icon.Package },
  { label: 'Bookings', icon: Icon.Receipt },
  { label: 'Approvals', icon: Icon.Check, chevron: true },
  { label: 'Content', icon: Icon.Clipboard },
  { label: 'Finance', icon: Icon.Calculator, chevron: true, active: true },
  { label: 'Directory', icon: Icon.Hotel, chevron: true },
  { label: 'Reports', icon: Icon.Filter },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-5 py-5">
        <span className="text-2xl font-bold text-brand">ciergo</span>
        <button className="text-gray-400 hover:text-gray-600">
          <Icon.Filter width={18} height={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ label, icon: I, chevron, active }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
              ${active ? 'bg-brand-soft text-brand' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <I width={18} height={18} />
            <span className="flex-1 text-left">{label}</span>
            {chevron && <Icon.ChevronRight width={14} height={14} className="text-gray-300" />}
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Icon.Calculator width={18} height={18} />
          <span className="flex-1 text-left">Settings</span>
          <Icon.ChevronRight width={14} height={14} className="text-gray-300" />
        </button>
      </div>
    </aside>
  );
}
