import { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.jsx';

function Menu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
      >
        <Icon.Dots width={16} height={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => { setOpen(false); it.onClick?.(); }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50
                ${it.danger ? 'text-red-600' : 'text-gray-700'}`}
            >
              <it.icon width={15} height={15} />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the correct action set for a row based on tab + booking status.
 * Rules encoded here mirror the spec (Bookings / Approval sub-views / Deleted).
 */
export default function RowActions({ booking, tab, mutate }) {
  const id = booking._id;

  // Deleted tab: Restore, Duplicate
  if (tab === 'deleted') {
    return (
      <div className="flex items-center justify-end gap-2">
        <IconButton icon={Icon.Restore} title="Restore" onClick={() => mutate.restore(id)} />
        <Menu items={[
          { label: 'Restore', icon: Icon.Restore, onClick: () => mutate.restore(id) },
          { label: 'Duplicate', icon: Icon.Copy },
        ]} />
      </div>
    );
  }

  // Waiting for Approval tab
  if (tab === 'approval') {
    if (booking.bookingStatus === 'Pending') {
      // Tick / Cross to approve or reject
      return (
        <div className="flex items-center justify-end gap-2">
          <IconButton icon={Icon.Check} title="Approve" tone="green" onClick={() => mutate.approve(id)} />
          <IconButton icon={Icon.Cross} title="Reject" tone="red" onClick={() => mutate.reject(id)} />
        </div>
      );
    }
    if (booking.bookingStatus === 'Rejected') {
      // Send for Approval again, Delete, Duplicate
      return (
        <div className="flex items-center justify-end gap-2">
          <IconButton icon={Icon.Send} title="Send for Approval again" onClick={() => mutate.resubmit(id)} />
          <Menu items={[
            { label: 'Send for Approval', icon: Icon.Send, onClick: () => mutate.resubmit(id) },
            { label: 'Duplicate', icon: Icon.Copy },
            { label: 'Delete', icon: Icon.Trash, danger: true, onClick: () => mutate.remove(id) },
          ]} />
        </div>
      );
    }
    // Approved sub-view -> standard actions (falls through)
  }

  // Bookings tab & Approved rows: Payment record + more actions
  return (
    <div className="flex items-center justify-end gap-2">
      <IconButton icon={Icon.Rupee} title="Record payment" />
      <Menu items={[
        { label: 'Edit', icon: Icon.Edit },
        { label: 'Link', icon: Icon.Link },
        { label: 'Duplicate', icon: Icon.Copy },
        { label: 'Delete', icon: Icon.Trash, danger: true, onClick: () => mutate.remove(id) },
      ]} />
    </div>
  );
}

function IconButton({ icon: I, title, onClick, tone }) {
  const toneClass =
    tone === 'green' ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
      : tone === 'red' ? 'text-red-600 border-red-200 hover:bg-red-50'
        : 'text-gray-500 border-gray-200 hover:bg-gray-50';
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${toneClass}`}
    >
      <I width={16} height={16} />
    </button>
  );
}
