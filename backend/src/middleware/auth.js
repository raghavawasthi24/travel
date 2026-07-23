import User from '../models/User.js';

/**
 * Lightweight auth shim. In a real system this would verify a JWT; here we
 * resolve the acting user from the `x-user-id` header so the role checks
 * (approval access) are exercised end-to-end without an auth provider.
 *
 * Falls back to the first admin so the demo works without wiring headers.
 */
export async function attachUser(req, _res, next) {
  try {
    const headerId = req.header('x-user-id');
    const user = headerId
      ? await User.findById(headerId)
      : await User.findOne({ canApprove: true });
    req.user = user || null;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireApprovalAccess(req, res, next) {
  if (!req.user || !req.user.canApprove) {
    return res
      .status(403)
      .json({ success: false, message: 'Approval access required' });
  }
  next();
}
