# Plan: Special Case Sales (Admin Links & Door Flow)

One unified flow for both use cases: admin override links and door sales. Same page, same checkout, different tokens.

---

## Overview

| Use case | Token | Date | Tier | Bypass sold-out? |
|----------|-------|------|------|-------------------|
| **Admin link (specific)** | `{ dateId, tierId?, exp }` | Pre-selected | Pre-selected or guest picks | Yes |
| **Admin link (open)** | `{ door: true, exp }` | Guest picks | Guest picks | Yes |
| **Door QR** | `{ door: true, exp }` | Inferred from today | Default Community | Yes |

---

## 1. Token System

**Signed token in URL** – proves link was created by admin, no secret exposed.

**Token types:**
- **Specific:** `{ dateId, tierId?, exp }` – pre-selects date (and optionally tier)
- **Door:** `{ door: true, exp }` – generic bypass; date inferred or guest picks; tier defaults to Community

**Env:** `ADMIN_LINK_SECRET` – sign/verify. Generate: `openssl rand -hex 32`

---

## 2. Door Flow (One QR)

**URL:** `https://site.com/invite?ticket=eyJ...` (door token)

**Flow:**
1. Guest scans QR → lands on main invite page with `?ticket=...`
2. **Date:** Inferred from today (Wed/Thu/Fri). Fallback: first night if no match.
3. **Tier:** Defaults to Community. Guest can change.
4. Guest enters name, email → pays
5. Same Stripe, webhook, sheet, confirmation email
6. `device: 'door'` in metadata for sheet/analytics

**One QR** for all 3 nights. Date inference handles ~5 door sales/night; midnight edge case is rare.

---

## 3. Admin Link Flow

**Admin page:** `/admin/link` (protected)

**Options:**
- **Specific date:** Pre-select date (and optionally tier) → guest gets pre-filled form
- **Open link:** Guest picks date and tier (same as door token, but for remote use)

**Flow:**
1. Admin picks "Specific date" or "Open link"
2. If specific: picks date, optionally tier
3. Clicks "Generate" → copies URL
4. Sends to guest
5. Guest opens → form pre-filled (or open) → pays
6. Bypasses capacity in all cases

---

## 4. Build Order

1. **Token lib** (`lib/admin-token.ts`) – sign, verify, parse
2. **Checkout API** – accept `ticket`, verify, skip capacity when valid
3. **Main page** – read `?ticket=`, infer date for door, default tier, pass `ticket` to checkout
4. **Admin link page** (`/admin/link`) – generate links, protected

---

## 5. File Changes

| File | Change |
|------|--------|
| `lib/admin-token.ts` | New – sign, verify, parse token |
| `app/api/checkout/route.ts` | Add `ticket` param, skip capacity when valid |
| `app/page.tsx` | Pass `ticket` from searchParams |
| `app/components/carrd-style-page.tsx` | Accept `initialTicket`, `initialDate`, `initialTier`; infer date for door; default tier to Community; send `ticket` in checkout |
| `app/admin/link/page.tsx` | New – form to generate links (protected) |
| `app/api/webhooks/stripe/route.ts` | Add `device: 'door'` to row when present |
| `.env.example` | Add `ADMIN_LINK_SECRET` |

---

## 6. Implementation Details

### Token payload
```ts
// Specific
{ dateId: 'mar-18', tierId?: 'community', exp: number }

// Door / Open
{ door: true, exp: number }
```

### Date inference (door)
```ts
const today = new Date().toISOString().slice(0, 10) // "2026-03-18"
const match = eventDates.find(d => d.value === today)
const dateId = match?.id ?? eventDates[0].id
```

### Checkout bypass
```ts
if (body.ticket) {
  const payload = verifyToken(body.ticket)
  if (payload) skipCapacityCheck = true
}
```

### Admin page protection
Simple: `?secret=xxx` in URL (matches `ADMIN_LINK_SECRET`) or basic password. Staff-only.

---

## 7. Environment Variables

```
ADMIN_LINK_SECRET=  # openssl rand -hex 32
```
