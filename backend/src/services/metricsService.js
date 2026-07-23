import Booking from '../models/Booking.js';
import { BOOKING_STATUS } from '../utils/constants.js';

/**
 * MetricsService — owns the financial calculation logic exclusively.
 *
 * Everything is computed server-side via a MongoDB aggregation so the client
 * never has to trust or replicate the maths.
 *
 *   You Give (Red)  = pendingToVendor + pendingToCustomer (refunds)
 *   You Get  (Green)= pendingFromVendor + pendingFromCustomer
 *   Net             = You Get - You Give
 *
 * "Exclude unapproved bookings": a booking counts only if it is not deleted AND
 * (it does not require approval OR it has been approved). Pending/Rejected
 * approval-bookings are excluded.
 */
export class MetricsService {
  /**
   * @param {object} baseFilter - optional extra filter (e.g. active date range)
   *   so the pills reflect the same filters as the table when desired.
   */
  static async getMetrics(baseFilter = {}) {
    const match = {
      ...baseFilter,
      isDeleted: { $ne: true },
      $or: [
        { requiresApproval: { $ne: true } },
        { bookingStatus: BOOKING_STATUS.APPROVED },
      ],
    };

    const [result] = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          pendingToVendor: { $sum: '$ledger.pendingToVendor' },
          pendingToCustomer: { $sum: '$ledger.pendingToCustomer' },
          pendingFromVendor: { $sum: '$ledger.pendingFromVendor' },
          pendingFromCustomer: { $sum: '$ledger.pendingFromCustomer' },
        },
      },
      {
        $project: {
          _id: 0,
          youGive: { $add: ['$pendingToVendor', '$pendingToCustomer'] },
          youGet: { $add: ['$pendingFromVendor', '$pendingFromCustomer'] },
        },
      },
    ]);

    const youGive = result?.youGive ?? 0;
    const youGet = result?.youGet ?? 0;
    const net = youGet - youGive;

    return {
      net: { value: Math.abs(net), tone: net >= 0 ? 'green' : 'red', raw: net },
      youGive: { value: youGive, tone: 'red', direction: 'outward' },
      youGet: { value: youGet, tone: 'green', direction: 'inward' },
      currency: 'INR',
    };
  }
}

export default MetricsService;
