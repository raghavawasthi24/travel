import Breadcrumb from './Breadcrumb.jsx';
import { Icon } from './icons.jsx';

export default function Topbar({ currentUser }) {
  return (
    <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-3.5">
      <Breadcrumb />

      <div className="relative mx-auto hidden max-w-xl flex-1 md:block">
        <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-16 text-sm outline-none focus:border-brand focus:bg-white"
          placeholder="Search or type command..."
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs text-gray-400">
          ⌘ K
        </kbd>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Icon.Bell width={20} height={20} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: currentUser?.avatarColor || '#6d28d9' }}
          >
            {currentUser?.initials || 'YM'}
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold leading-tight">
              {currentUser?.name || 'Yash Manocha'}
            </div>
            <div className="text-xs text-gray-500">{currentUser?.role || 'Sales Lead'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
