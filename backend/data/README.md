# Dummy data

Two Extended-JSON (NDJSON, one doc per line) files, ready for `mongoimport` or Compass:

- `users.json` — 5 users (2 approvers: Yash / Aditya, 3 agents)
- `bookings.json` — 78 bookings with fixed ObjectIds so `owners` references resolve

Regenerate with: `node data/generate.mjs`

## What's inside (matches the mock)

| Bucket | Count |
|--------|-------|
| Total bookings | 78 |
| Deleted (Deleted tab) | 6 |
| Requires approval | 16 → Pending 5 · Approved 5 · Rejected 5 · (1 deleted) |
| Bookings tab (active, approved or non-approval) | 62 (56 with the default "hide incomplete") |
| Incomplete (toggle) | 6 |

Metric pills (default view, incomplete hidden): **You Give ₹40,250 · You Get ₹47,700 · Net ₹7,450 (green)**.

## Option A — mongoimport (recommended)

```bash
cd backend

mongoimport --uri "mongodb://127.0.0.1:27017/finance_bookings" \
  --collection users --file data/users.json --drop

mongoimport --uri "mongodb://127.0.0.1:27017/finance_bookings" \
  --collection bookings --file data/bookings.json --drop
```

`--drop` clears the collection first so re-imports don't duplicate. For MongoDB Atlas,
swap the `--uri` for your `mongodb+srv://...` connection string.

## Option B — MongoDB Compass

Databases → create/select `finance_bookings` → create collection `users` →
**Add Data → Import JSON** → pick `data/users.json`. Repeat for `bookings`.
Compass auto-detects the `$oid` / `$date` Extended-JSON types.

## Option C — the seed script (no files needed)

```bash
npm run seed   # wipes + repopulates via Mongoose (data/generate.mjs mirrors this)
```
