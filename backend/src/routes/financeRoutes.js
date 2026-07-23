import { Router } from 'express';
import {
  getBookings,
  getMetrics,
  updateBookingStatus,
  deleteBooking,
  restoreBooking,
} from '../controllers/bookingController.js';
import { requireApprovalAccess } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// Bookings list (pagination, sorting, filtering, tabs).
router.get('/bookings', getBookings);

// Top placeholder metrics (Net / You Give / You Get).
router.get('/bookings/metrics', getMetrics);

// Approve / reject / resubmit — restricted to users with approval access.
router.patch('/bookings/:id/status', requireApprovalAccess, updateBookingStatus);

// Soft-delete & restore.
router.delete('/bookings/:id', deleteBooking);
router.post('/bookings/:id/restore', restoreBooking);

// Helper for the frontend to list selectable owners + know the current user.
router.get('/owners', async (_req, res, next) => {
  try {
    const owners = await User.find().select('name initials avatarColor role canApprove');
    res.json({ success: true, owners });
  } catch (err) {
    next(err);
  }
});

export default router;
