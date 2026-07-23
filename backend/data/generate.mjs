/**
 * Generates mongoimport-ready Extended-JSON files:
 *   data/users.json     (5 docs)
 *   data/bookings.json  (78 docs)
 *
 * ObjectIds are fixed so booking.owners references stay valid across imports.
 * Run:  node data/generate.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));

const oid = (n) => '6a0000000000000000' + String(n).padStart(6, '0'); // valid 24-hex
const isoDate = (y, m, d) => new Date(Date.UTC(y, m, d, 6, 0, 0)).toISOString();

const USERS = [
  { _id: oid(1), name: 'Yash Manocha', email: 'yash@ciergo.app', initials: 'YM', avatarColor: '#6d28d9', role: 'Sales Lead', canApprove: true },
  { _id: oid(2), name: 'Aditya Sharma', email: 'aditya@ciergo.app', initials: 'AS', avatarColor: '#ef4444', role: 'Admin', canApprove: true },
  { _id: oid(3), name: 'Amit Kumar', email: 'amit@ciergo.app', initials: 'AK', avatarColor: '#8b5cf6', role: 'Agent', canApprove: false },
  { _id: oid(4), name: 'Sneha Rao', email: 'sneha@ciergo.app', initials: 'SR', avatarColor: '#6366f1', role: 'Agent', canApprove: false },
  { _id: oid(5), name: 'Vikas Gupta', email: 'vikas@ciergo.app', initials: 'VG', avatarColor: '#3b82f6', role: 'Agent', canApprove: false },
];

const LEADS = ['Anand Mishra', 'Sumit Jha', 'Zaheer', 'Gaurav Kapoor', 'Shirish Pandey', 'Ravi Verma', 'Neha Singh', 'Karan Mehta'];
const SERVICES = [
  { type: 'Flight', label: 'Flight' },
  { type: 'Accommodation', label: 'Accomodation' },
  { type: 'Package', label: 'Explore UAE', destination: 'UAE' },
  { type: 'Transportation', label: 'Transportation' },
];
const PAYMENTS = ['Paid', 'Partially Paid', 'Pending'];
const PREFIX = ['OS', 'LI'];

// Deterministic PRNG so re-runs produce identical data.
function makeRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const rng = makeRng(42);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

const ownerIds = USERS.slice(1).map((u) => ({ $oid: u._id })); // AS AK SR VG

const bookings = [];
for (let i = 0; i < 78; i++) {
  const requiresApproval = i % 5 === 0;
  let bookingStatus = 'Approved';
  if (requiresApproval) {
    const r = i % 3;
    bookingStatus = r === 0 ? 'Pending' : r === 1 ? 'Approved' : 'Rejected';
  }
  const isDeleted = i >= 72;
  const rejectedOrPending = requiresApproval && bookingStatus !== 'Approved';
  const paymentStatus = isDeleted || rejectedOrPending ? 'Pending' : pick(PAYMENTS);

  const eligible = !isDeleted && (!requiresApproval || bookingStatus === 'Approved');
  const ledger =
    eligible && paymentStatus !== 'Paid'
      ? {
          pendingToVendor: 500 + (i % 4) * 250,
          pendingToCustomer: i % 6 === 0 ? 300 : 0,
          pendingFromVendor: i % 3 === 0 ? 450 : 0,
          pendingFromCustomer: 600 + (i % 5) * 200,
        }
      : { pendingToVendor: 0, pendingToCustomer: 0, pendingFromVendor: 0, pendingFromCustomer: 0 };

  const now = isoDate(2026, 1, 1 + (i % 20));
  bookings.push({
    _id: { $oid: oid(1000 + i) },
    bookingId: `${pick(PREFIX)}-ABC${(12 + i).toString().padStart(2, '0')}`,
    leadPax: pick(LEADS),
    bookingDate: { $date: isoDate(2026, 1, 1 + (i % 20)) },
    travelDate: { $date: isoDate(2026, 2, 5) },
    service: pick(SERVICES),
    bookingStatus,
    paymentStatus,
    amount: 24580,
    owners: ownerIds,
    voucher: { generated: i % 4 !== 0, number: `V-${1000 + i}` },
    tasks: [{ title: 'Collect documents', completed: i % 2 === 0 }],
    ledger,
    requiresApproval,
    isComplete: i % 9 !== 0,
    isDeleted,
    ...(isDeleted ? { deletedAt: { $date: isoDate(2026, 6, 1 + (i % 20)) } } : {}),
    createdAt: { $date: now },
    updatedAt: { $date: now },
  });
}

// mongoimport expects one JSON document per line (NDJSON).
const users = USERS.map((u) => {
  const now = isoDate(2026, 0, 1);
  return { ...u, _id: { $oid: u._id }, createdAt: { $date: now }, updatedAt: { $date: now } };
});

writeFileSync(join(DIR, 'users.json'), users.map((u) => JSON.stringify(u)).join('\n') + '\n');
writeFileSync(join(DIR, 'bookings.json'), bookings.map((b) => JSON.stringify(b)).join('\n') + '\n');

console.log(`Wrote ${users.length} users -> data/users.json`);
console.log(`Wrote ${bookings.length} bookings -> data/bookings.json`);
