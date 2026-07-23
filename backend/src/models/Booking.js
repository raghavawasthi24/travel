import mongoose from 'mongoose';
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  SERVICE_TYPE,
} from '../utils/constants.js';

/* ---- Sub-documents (each models one cohesive concept) ---- */

const serviceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(SERVICE_TYPE), required: true },
    // Optional label under the service icon (e.g. "Explore UAE", "UAE")
    label: { type: String, trim: true },
    destination: { type: String, trim: true },
  },
  { _id: false }
);

const voucherSchema = new mongoose.Schema(
  {
    generated: { type: Boolean, default: false },
    number: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
});

/**
 * Payment ledger buckets. Kept explicit so the metrics aggregation is a plain
 * sum and never has to infer direction from status.
 *   - pendingToVendor    : we still owe a vendor        -> You Give
 *   - pendingToCustomer  : refund we owe a customer     -> You Give
 *   - pendingFromVendor  : a vendor still owes us        -> You Get
 *   - pendingFromCustomer: a customer still owes us      -> You Get
 */
const paymentLedgerSchema = new mongoose.Schema(
  {
    pendingToVendor: { type: Number, default: 0, min: 0 },
    pendingToCustomer: { type: Number, default: 0, min: 0 },
    pendingFromVendor: { type: Number, default: 0, min: 0 },
    pendingFromCustomer: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/* ---- Root Booking document ---- */

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    }, // e.g. OS-ABC12, LI-ABC12
    leadPax: { type: String, required: true, trim: true },
    bookingDate: { type: Date, required: true, default: Date.now },
    travelDate: { type: Date, required: true },

    service: { type: serviceSchema, required: true },

    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.APPROVED,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    amount: { type: Number, required: true, min: 0 },

    // Multiple owner chips are shown; the first is treated as the primary owner.
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    voucher: { type: voucherSchema, default: () => ({}) },
    tasks: [taskSchema],
    ledger: { type: paymentLedgerSchema, default: () => ({}) },

    // Bookings that must pass through the approval flow appear in the
    // "Waiting for Approval" tab. Non-approval bookings show straight away.
    requiresApproval: { type: Boolean, default: false, index: true },

    // Rejected bookings can be re-submitted; keep a light audit trail.
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    isComplete: { type: Boolean, default: true }, // powers "Show Incomplete Bookings"

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound indexes for the common list queries (filter + sort).
bookingSchema.index({ isDeleted: 1, requiresApproval: 1, bookingStatus: 1 });
bookingSchema.index({ travelDate: 1 });
bookingSchema.index({ amount: 1 });

// Virtual convenience flag used by the metrics service and controllers.
bookingSchema.virtual('countsTowardMetrics').get(function () {
  if (this.isDeleted) return false;
  if (!this.requiresApproval) return true;
  return this.bookingStatus === BOOKING_STATUS.APPROVED;
});

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

export default mongoose.model('Booking', bookingSchema);
