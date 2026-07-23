const PAYMENT_STYLES = {
  Paid: 'bg-emerald-50 text-emerald-600',
  'Partially Paid': 'bg-amber-50 text-amber-600',
  Pending: 'bg-amber-50 text-amber-600',
};

const BOOKING_STYLES = {
  Approved: 'bg-emerald-50 text-emerald-600',
  Pending: 'bg-amber-50 text-amber-600',
  Rejected: 'bg-red-50 text-red-600',
};

export function PaymentBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${PAYMENT_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export function BookingBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${BOOKING_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
