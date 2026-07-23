# Finance › Bookings Dashboard

Full-stack implementation of the **Finance / Bookings** screen (reference: `Finance - Bookings.png`),
built with a SOLID, layered architecture.

```
travel/
├── backend/                     Node + Express + Mongoose (Controller → Service → Model)
│   └── src/
│       ├── config/db.js         DB connection lifecycle
│       ├── models/              Booking.js, User.js  (Mongoose schemas)
│       ├── services/            bookingService.js, metricsService.js  (all business logic)
│       ├── controllers/         bookingController.js  (thin HTTP layer)
│       ├── routes/              financeRoutes.js
│       ├── middleware/          auth.js  (acting-user + approval-access guard)
│       ├── utils/               constants.js, queryBuilder.js
│       ├── app.js               express app factory (importable, testable)
│       ├── server.js            boot
│       └── seed.js              reproduces the mock data (5 users, 78 bookings)
└── frontend/                    React + Vite + Tailwind (Components → Hooks → Services)
    └── src/
        ├── services/            api.js (HTTP client), bookingService.js (endpoints)
        ├── context/             FiltersContext.jsx  (single source of UI state)
        ├── hooks/               useBookings, useMetrics, useSession
        ├── components/          Sidebar, Topbar, Breadcrumb, MetricsPills, FiltersBar,
        │                        Tabs, ApprovalBanner, BookingsTable, RowActions,
        │                        Pagination, StatusBadge, OwnerAvatars, ServiceCell, icons
        ├── pages/               FinanceBookings.jsx  (view composition only)
        └── App.jsx
```

## Architecture — SOLID mapping

| Principle | Where |
|-----------|-------|
| **SRP** | UI (components) ↔ state (hooks/context) ↔ data (services) ↔ business logic (backend services) are separate layers. |
| **OCP** | Domain enums live in `utils/constants.js`; add a status/service type there, not scattered. |
| **LSP/ISP** | Small focused components & service methods; the frontend `bookingService` is the only booking-endpoint interface. |
| **DIP** | Components depend on hooks; hooks depend on the service abstraction — never on `fetch` or Mongo directly. |

All financial metrics are computed **server-side** via a MongoDB aggregation (`metricsService.js`) — never on the client.

## Metrics logic

`GET /api/finance/bookings/metrics`

- **You Give** (red)  = `pendingToVendor + pendingToCustomer` (refunds)
- **You Get** (green) = `pendingFromVendor + pendingFromCustomer`
- **Net** = `You Get − You Give` → green if ≥ 0, else red
- Excludes unapproved bookings: a booking counts only if not deleted **and** (`!requiresApproval` **or** `bookingStatus === 'Approved'`).

## API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/finance/bookings` | pagination (`page`,`limit`), sort (`sortBy`=amount\|travelDate, `sortOrder`), filters (booking/travel date ranges, `owner`, `type`, `search`, `showIncomplete`), tabs (`tab`=bookings\|deleted\|approval, `approvalStatus`) |
| GET | `/api/finance/bookings/metrics` | Net / You Give / You Get |
| PATCH | `/api/finance/bookings/:id/status` | `{ action: 'approve' \| 'reject' \| 'resubmit' }` — **approval access required** |
| DELETE | `/api/finance/bookings/:id` | soft delete, locks payment to Pending |
| POST | `/api/finance/bookings/:id/restore` | restore |
| GET | `/api/finance/owners` | selectable owners + acting user |

Auth is a demo shim: the acting user is resolved from the `x-user-id` header (frontend stores it in `localStorage`).

## Run it

```bash
# 1. MongoDB must be reachable (local mongod or Atlas URI)
cd backend
cp .env.example .env          # adjust MONGODB_URI if needed
npm install
npm run seed                  # 5 users + 78 bookings matching the mock
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173  (proxies /api → :5000)
```

## Tabs & rules

- **Bookings** — approved + non-approval bookings, latest modified first. Actions: record payment, edit/delete/link/duplicate.
- **Waiting for Approval** — visible only to approvers. Sub-filter All/Pending/Approved/Rejected with a status strip.
  - *Pending*: payment stays Pending; tick/cross to approve/reject.
  - *Approved*: standard actions.
  - *Rejected*: payment stays Pending; send for approval again / delete / duplicate.
- **Deleted** — latest deleted first; payment locked to Pending. Actions: restore, duplicate.

Verified end-to-end against an in-memory MongoDB: metrics math, pagination, sorting, search,
role-gated approval (agent → 403, admin → 200), and the payment-lock rules on delete/reject.
