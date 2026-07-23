import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import Booking from './models/Booking.js';
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_TYPE,
  USER_ROLE,
} from './utils/constants.js';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_bookings';

const USERS = [
  { name: 'Yash Manocha', email: 'yash@ciergo.app', initials: 'YM', avatarColor: '#6d28d9', role: USER_ROLE.SALES_LEAD, canApprove: true },
  { name: 'Aditya Sharma', email: 'aditya@ciergo.app', initials: 'AS', avatarColor: '#ef4444', role: USER_ROLE.ADMIN, canApprove: true },
  { name: 'Amit Kumar', email: 'amit@ciergo.app', initials: 'AK', avatarColor: '#8b5cf6', role: USER_ROLE.AGENT },
  { name: 'Sneha Rao', email: 'sneha@ciergo.app', initials: 'SR', avatarColor: '#6366f1', role: USER_ROLE.AGENT },
  { name: 'Vikas Gupta', email: 'vikas@ciergo.app', initials: 'VG', avatarColor: '#3b82f6', role: USER_ROLE.AGENT },
];

const LEADS = ['Anand Mishra', 'Sumit Jha', 'Zaheer', 'Gaurav Kapoor', 'Shirish Pandey', 'Ravi Verma', 'Neha Singh', 'Karan Mehta'];

const SERVICES = [
  { type: SERVICE_TYPE.FLIGHT, label: 'Flight' },
  { type: SERVICE_TYPE.ACCOMMODATION, label: 'Accomodation' },
  { type: SERVICE_TYPE.PACKAGE, label: 'Explore UAE', destination: 'UAE' },
  { type: SERVICE_TYPE.TRANSPORTATION, label: 'Transportation' },
];

// Deterministic pseudo-random so seeds are reproducible without Math.random.
function makeRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

async function run() {
  await connectDB(MONGODB_URI);
  await Promise.all([User.deleteMany({}), Booking.deleteMany({})]);

  const users = await User.insertMany(USERS);
  const rng = makeRng(42);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  const paymentStates = [PAYMENT_STATUS.PAID, PAYMENT_STATUS.PARTIALLY_PAID, PAYMENT_STATUS.PENDING];
  const prefixes = ['OS', 'LI'];
  const bookings = [];

  for (let i = 0; i < 78; i++) {
    const requiresApproval = i % 5 === 0; // ~20% go through approval
    let bookingStatus = BOOKING_STATUS.APPROVED;
    if (requiresApproval) {
      const r = i % 3;
      bookingStatus =
        r === 0 ? BOOKING_STATUS.PENDING : r === 1 ? BOOKING_STATUS.APPROVED : BOOKING_STATUS.REJECTED;
    }

    const isDeleted = i >= 72; // last few are deleted
    const rejectedOrPending =
      requiresApproval && bookingStatus !== BOOKING_STATUS.APPROVED;

    // Rule: pending/rejected/deleted keep payment "Pending".
    const paymentStatus =
      isDeleted || rejectedOrPending ? PAYMENT_STATUS.PENDING : pick(paymentStates);

    const amount = 24580; // matches the reference mock
    const owners = users.slice(1).map((u) => u._id); // AS AK SR VG chips

    // Only unpaid, metric-eligible bookings carry pending ledger balances.
    const eligible = !isDeleted && (!requiresApproval || bookingStatus === BOOKING_STATUS.APPROVED);
    const ledger =
      eligible && paymentStatus !== PAYMENT_STATUS.PAID
        ? {
            pendingToVendor: 500 + (i % 4) * 250,
            pendingToCustomer: i % 6 === 0 ? 300 : 0,
            pendingFromVendor: i % 3 === 0 ? 450 : 0,
            pendingFromCustomer: 600 + (i % 5) * 200,
          }
        : {};

    bookings.push({
      bookingId: `${pick(prefixes)}-ABC${(12 + i).toString().padStart(2, '0')}`,
      leadPax: pick(LEADS),
      bookingDate: new Date(2026, 1, 1 + (i % 20)),
      travelDate: new Date(2026, 2, 5),
      service: pick(SERVICES),
      bookingStatus,
      paymentStatus,
      amount,
      owners,
      voucher: { generated: i % 4 !== 0, number: `V-${1000 + i}` },
      tasks: [{ title: 'Collect documents', completed: i % 2 === 0 }],
      ledger,
      requiresApproval,
      isComplete: i % 9 !== 0, // a few incomplete to exercise the toggle
      isDeleted,
      deletedAt: isDeleted ? new Date(2026, 6, 1 + i) : undefined,
    });
  }

  await Booking.insertMany(bookings);
  console.log(`Seeded ${users.length} users and ${bookings.length} bookings.`);
  await disconnectDB();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
