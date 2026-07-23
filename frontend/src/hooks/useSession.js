import { useEffect, useState } from 'react';
import { bookingService } from '../services/bookingService.js';
import { getActingUserId, setActingUserId } from '../services/api.js';

/**
 * Loads the owner list and resolves the current acting user. The acting user's
 * `canApprove` flag gates the "Waiting for Approval" tab and approve/reject
 * actions in the UI (backend enforces it too).
 */
export function useSession() {
  const [owners, setOwners] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    bookingService.owners().then(({ owners }) => {
      setOwners(owners);
      let id = getActingUserId();
      if (!id) {
        // Default to an approver (matches "Yash Manocha / Sales Lead" in mock).
        const approver = owners.find((o) => o.canApprove) || owners[0];
        id = approver?._id || '';
        if (id) setActingUserId(id);
      }
      setCurrentUser(owners.find((o) => o._id === id) || null);
    }).catch(() => {});
  }, []);

  return { owners, currentUser, canApprove: !!currentUser?.canApprove };
}
