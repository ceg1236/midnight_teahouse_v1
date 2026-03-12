# Door Link Verification

## Manual verification

To confirm door auto-date selection works:

1. **Generate a door link** – Go to `/admin/link`, authenticate, check "Door (QR)", click Generate Link.
2. **Open the link** (in an incognito window or different browser to avoid session state).
3. **Expected behavior:**
   - You land directly on **step 3 (Complete Your Reservation)** – no "Reserve Your Seat" click.
   - **Date** is auto-selected:
     - If today matches an event date (e.g. March 18, 19, or 20, 2026), that date is used.
     - Otherwise the first event date (March 18) is used.
   - **Community** tier is pre-selected (1 ticket).
   - The reservation summary shows the date and "Community — $40 × 1 = $40".

## Automated tests

### Unit tests

```bash
pnpm test
```

- **`lib/__tests__/door-date.test.ts`** – `resolveDoorDate` logic (today match vs fallback).
- **`lib/__tests__/admin-token-decode.test.ts`** – Token payload decoding (door, open, dateId+tierId).
- **`app/api/admin/generate-link/__tests__/route.test.ts`** – Door/open/specific link generation.

### E2E test

```bash
pnpm test:e2e:install   # first time: install Playwright browsers
pnpm test:e2e e2e/door-link.spec.ts
```

Requires `ADMIN_PASSWORD` and `ADMIN_LINK_SECRET` in `.env.local`. The test:

1. Calls `/api/admin/generate-link` with `door: true`.
2. Visits the returned URL.
3. Asserts step 3 is visible with date and Community pre-filled.
