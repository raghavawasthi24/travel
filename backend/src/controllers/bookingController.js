import BookingService from '../services/bookingService.js';
import MetricsService from '../services/metricsService.js';
import { buildFilter } from '../utils/queryBuilder.js';

/**
 * Thin HTTP layer. Controllers never contain business logic — they delegate to
 * services and shape the HTTP response. Errors bubble to the error middleware.
 */

export async function getBookings(req, res, next) {
  try {
    const data = await BookingService.list(req.query);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function getMetrics(req, res, next) {
  try {
    // Pills honour the same date/owner/type filters as the table (search excluded).
    const filter = buildFilter({ ...req.query, search: undefined });
    const metrics = await MetricsService.getMetrics(filter);
    res.json({ success: true, metrics });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { action } = req.body; // 'approve' | 'reject' | 'resubmit'
    const booking = await BookingService.updateStatus(
      req.params.id,
      action,
      req.user?._id
    );
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
}

export async function deleteBooking(req, res, next) {
  try {
    const booking = await BookingService.softDelete(req.params.id);
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
}

export async function restoreBooking(req, res, next) {
  try {
    const booking = await BookingService.restore(req.params.id);
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
}
