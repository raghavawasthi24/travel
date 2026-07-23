/**
 * Pure helpers that translate raw request query params into a Mongo filter and
 * sort object. Kept side-effect free so they are trivially unit-testable and
 * reusable across services (Single Responsibility / Dependency Inversion:
 * services depend on this abstraction, not on Express req objects).
 */

const SORTABLE_FIELDS = { amount: 'amount', travelDate: 'travelDate' };

export function buildSort({ sortBy, sortOrder } = {}) {
  const field = SORTABLE_FIELDS[sortBy];
  const dir = sortOrder === 'asc' ? 1 : -1;
  if (field) return { [field]: dir };
  // Default: latest modified first (used by the Bookings tab).
  return { updatedAt: -1 };
}

export function buildDateRange(start, end) {
  const range = {};
  if (start) range.$gte = new Date(start);
  if (end) {
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    range.$lte = e;
  }
  return Object.keys(range).length ? range : null;
}

export function buildFilter(query = {}) {
  const {
    bookingDateStart,
    bookingDateEnd,
    travelDateStart,
    travelDateEnd,
    owner,
    type,
    search,
    showIncomplete,
  } = query;

  const filter = {};

  const bookingRange = buildDateRange(bookingDateStart, bookingDateEnd);
  if (bookingRange) filter.bookingDate = bookingRange;

  const travelRange = buildDateRange(travelDateStart, travelDateEnd);
  if (travelRange) filter.travelDate = travelRange;

  if (owner) filter.owners = owner; // ObjectId string; Mongoose casts it.

  if (type && type !== 'All Bookings' && type !== 'all') {
    filter['service.type'] = type;
  }

  // Hide incomplete bookings unless the toggle is on.
  if (!(showIncomplete === 'true' || showIncomplete === true)) {
    filter.isComplete = true;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    const or = [{ bookingId: rx }, { leadPax: rx }];
    const asNumber = Number(search);
    if (!Number.isNaN(asNumber)) or.push({ amount: asNumber });
    filter.$or = or;
  }

  return filter;
}

export function buildPagination({ page, limit } = {}) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
