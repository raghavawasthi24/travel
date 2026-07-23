import Booking from '../models/Booking.js';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import {
  buildFilter,
  buildSort,
  buildPagination,
} from '../utils/queryBuilder.js';

/**
 * BookingService — all read/write business rules for bookings live here.
 * Controllers stay thin; they only translate HTTP <-> service calls.
 */
export class BookingService {
  /* ---------------- Tab scoping ---------------- */

  /**
   * Returns the base filter for a given tab so the list logic is centralised.
   *   bookings : active, not awaiting approval (approved OR non-approval)
   *   approval : requiresApproval; optional approvalStatus sub-filter
   *   deleted  : soft-deleted
   */
  static tabFilter(tab, approvalStatus) {
    switch (tab) {
      case 'deleted':
        return { isDeleted: true };
      case 'approval': {
        const f = { isDeleted: { $ne: true }, requiresApproval: true };
        if (approvalStatus && approvalStatus !== 'all') {
          f.bookingStatus =
            approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1);
        }
        return f;
      }
      case 'bookings':
      default:
        return {
          isDeleted: { $ne: true },
          $or: [
            { requiresApproval: { $ne: true } },
            { bookingStatus: BOOKING_STATUS.APPROVED },
          ],
        };
    }
  }

  /* ---------------- List ---------------- */

  static async list(query = {}) {
    const { tab = 'bookings', approvalStatus } = query;

    // Combine tab scope + user filters. Both may define $or, so merge via $and.
    const tabScope = this.tabFilter(tab, approvalStatus);
    const userFilter = buildFilter(query);
    const filter = mergeFilters(tabScope, userFilter);

    const sort = buildSort(query);
    // Tab-specific default ordering when no explicit sort was requested.
    if (!query.sortBy) {
      if (tab === 'deleted') sort.deletedAt = -1;
      else sort.updatedAt = -1;
    }

    const { page, limit, skip } = buildPagination(query);

    const [items, total] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('owners', 'name initials avatarColor role')
        .lean({ virtuals: true }),
      Booking.countDocuments(filter),
    ]);

    const start = total === 0 ? 0 : skip + 1;
    const end = Math.min(skip + limit, total);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
        start,
        end,
        showing: `Showing ${start}-${end} of ${total} Bookings`,
      },
    };
  }

  /* ---------------- Status transitions ---------------- */

  static async updateStatus(id, action, userId) {
    const booking = await Booking.findById(id);
    if (!booking) throw httpError(404, 'Booking not found');
    if (!booking.requiresApproval) {
      throw httpError(400, 'Booking does not require approval');
    }

    switch (action) {
      case 'approve':
        booking.bookingStatus = BOOKING_STATUS.APPROVED;
        booking.approvedBy = userId;
        booking.approvedAt = new Date();
        break;
      case 'reject':
        booking.bookingStatus = BOOKING_STATUS.REJECTED;
        // Rule: payment stays Pending for rejected bookings.
        booking.paymentStatus = PAYMENT_STATUS.PENDING;
        break;
      case 'resubmit':
        booking.bookingStatus = BOOKING_STATUS.PENDING;
        booking.approvedBy = undefined;
        booking.approvedAt = undefined;
        break;
      default:
        throw httpError(400, `Unknown action: ${action}`);
    }

    await booking.save();
    return booking.populate('owners', 'name initials avatarColor role');
  }

  /* ---------------- Soft delete / restore ---------------- */

  static async softDelete(id) {
    const booking = await Booking.findByIdAndUpdate(
      id,
      // Rule: payments linked to bookings can't be deleted -> lock to Pending.
      { isDeleted: true, deletedAt: new Date(), paymentStatus: PAYMENT_STATUS.PENDING },
      { new: true }
    );
    if (!booking) throw httpError(404, 'Booking not found');
    return booking;
  }

  static async restore(id) {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { isDeleted: false, $unset: { deletedAt: 1 } },
      { new: true }
    );
    if (!booking) throw httpError(404, 'Booking not found');
    return booking;
  }

  static async create(payload) {
    return Booking.create(payload);
  }
}

/* ---------------- helpers ---------------- */

function mergeFilters(a, b) {
  const clauses = [a, b].filter((f) => f && Object.keys(f).length);
  if (clauses.length <= 1) return clauses[0] || {};
  return { $and: clauses };
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export default BookingService;
