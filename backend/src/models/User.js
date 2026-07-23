import mongoose from 'mongoose';
import { USER_ROLE } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Two-letter monogram used for the avatar chips (AS, AK, SR, VG ...)
    initials: { type: String, required: true, uppercase: true, maxlength: 3 },
    avatarColor: { type: String, default: '#6d28d9' },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.AGENT,
    },
    // Drives visibility of the "Waiting for Approval" tab and PATCH status route.
    canApprove: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
