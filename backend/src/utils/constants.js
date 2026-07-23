/**
 * Shared domain enums. Kept in one place so models, services and validation
 * stay in sync (Open/Closed: extend statuses here, not scattered across files).
 */
export const BOOKING_STATUS = Object.freeze({
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
});

export const SERVICE_TYPE = Object.freeze({
  FLIGHT: 'Flight',
  ACCOMMODATION: 'Accommodation',
  TRANSPORTATION: 'Transportation',
  PACKAGE: 'Package',
});

export const USER_ROLE = Object.freeze({
  ADMIN: 'Admin',
  SALES_LEAD: 'Sales Lead',
  AGENT: 'Agent',
});

export const ROWS_PER_PAGE_OPTIONS = [6, 10, 20, 50, 100];
