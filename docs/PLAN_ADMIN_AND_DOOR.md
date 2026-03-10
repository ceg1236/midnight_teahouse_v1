# Plan: Admin Override Links & Door Ticket Flow

Two features to support:
1. **Admin override** – Create special purchase links that bypass sold-out, so admins can direct specific guests to buy even when a night shows "Sold Out"
2. **Door flow** – A dedicated `/door` page for at-the-door sales, with one QR code

---

## 1. Admin Override (Sold-Out Bypass)

### Goal
- Public site shows dates as "Sold Out" when capacity is hit
- Admins can generate links that let a specific guest buy a ticket for a specific date/tier, bypassing capacity

### Approach: Signed bypass token in URL

**Why:** The link is shared with the guest. We can't put a raw secret in the URL. A signed token (JWT or HMAC) proves the link was created by an admin without exposing the secret.

**Flow:**
1. Admin visits an internal page (e.g. `/admin/link`) or uses a script
2. Admin selects date, tier, optionally quantity
3. System generates a signed token: `{ dateId, tierId?, expires }` signed with `ADMIN_LINK_SECRET`
4. Admin copies link: `https://site.com/invite?ticket=eyJ...`
5. Guest opens link → form pre-selects date (and tier if in token) → guest enters name/email → pays
6. Checkout API receives `ticket` in the request body
7. If token is valid and not expired → skip capacity check
8. Webhook and sheet behave normally

### Implementation

| Item | Details |
|------|---------|
| **Token format** | JWT or HMAC-signed payload. Payload: `{ dateId, tierId?, exp }`. Sign with `ADMIN_LINK_SECRET`. |
| **Token lifetime** | e.g. 7 days (configurable). Prevents old links from working indefinitely. |
| **Admin page** | `/admin/link` – protected by simple password or `ADMIN_LINK_SECRET` in URL (admin-only). Form: date dropdown, tier dropdown, "Generate link" → copies URL. |
| **Checkout API** | Accept optional `ticket` in POST body. If present: verify signature + expiry. If valid: skip capacity check (lines 81–96). |
| **Main page** | When `?ticket=...` in URL: pass through to form. Form pre-selects date (and tier) from token payload. Sends `ticket` in checkout request. |
| **Env var** | `ADMIN_LINK_SECRET` – used to sign/verify tokens. Never exposed to client. |

### Security
- Token is signed; guests can't forge it
- Token doesn't contain the secret
- Expiry limits abuse of leaked links
- Admin page must be protected (password, or secret in URL that only staff know)

---

## 2. Door Ticket Flow

### Goal
- One QR code at the door
- Guest scans → lands on a streamlined page
- Single screen: date + tier + name + email → pay
- Same Stripe flow, webhook, sheet, confirmation email

### Approach: Dedicated `/door` page

**Flow:**
1. QR code links to `https://site.com/door`
2. Page shows compact form: date (dropdown), tier (buttons), name, email
3. Guest fills form, taps "Pay" → same `POST /api/checkout` as main flow
4. Redirect to Stripe → success → `/invite/success`
5. Webhook appends to sheet; confirmation email sent
6. Optional: add `device: 'door'` in metadata so sheet/analytics can distinguish door vs online

### Implementation

| Item | Details |
|------|---------|
| **Route** | `app/door/page.tsx` – new page |
| **Layout** | Minimal: same visual style as main site, but single-screen form. No hero video, no countdown. Date dropdown, tier selector, name, email, pay button. |
| **Checkout** | Same `POST /api/checkout`. Include `device: 'door'` so webhook can record it. |
| **Capacity** | Door uses same capacity check. If a night is sold out, checkout returns 409. For overflow at door, use admin link (see above) or manual door-sale form. |
| **Success** | Redirect to same `/invite/success` – works with `session_id` and `date_id` from Stripe. |
| **QR code** | Generate once (e.g. [qr-code-generator.com](https://www.qr-code-generator.com/) or similar). URL: `https://yoursite.com/door`. Print and post at door. |

### Optional: Door bypass for sold-out
If you want door sales to bypass capacity (staff decides at the door), options:
- **A)** Add `?door=1` + signed token to `/door` URL – same token approach as admin links
- **B)** Add `ADMIN_CHECKOUT_SECRET` – door page sends it when submitting (page would need to receive it from server at build time or a server action – more complex)
- **C)** Keep it simple: door follows capacity. For overflow, staff uses admin link or manual form

**Recommendation:** Start with (C). Add bypass later if needed.

---

## 3. Build Order

1. **Door page** (`/door`) – standalone form, reuses checkout API
2. **Checkout API** – add optional `ticket` param and bypass logic
3. **Token lib** – sign/verify helpers for `ticket`
4. **Main page** – read `?ticket=` from URL, pre-select date/tier, pass `ticket` to checkout
5. **Admin link page** (`/admin/link`) – form to generate links, protected

---

## 4. File Changes Summary

| File | Change |
|------|--------|
| `app/door/page.tsx` | New – door form page |
| `app/admin/link/page.tsx` | New – admin link generator (protected) |
| `lib/admin-token.ts` | New – sign/verify token helpers |
| `app/api/checkout/route.ts` | Add `ticket` handling, skip capacity when valid |
| `app/page.tsx` | Pass `ticket` from searchParams to CarrdStylePage |
| `app/components/carrd-style-page.tsx` | Accept `initialTicket`, pre-select from token, send `ticket` in checkout |
| `app/api/webhooks/stripe/route.ts` | Optional: record `device: 'door'` in sheet (if not already) |
| `.env.example` | Add `ADMIN_LINK_SECRET` |

---

## 5. Environment Variables

```
ADMIN_LINK_SECRET=  # Random string for signing bypass tokens. Generate with: openssl rand -hex 32
```

---

## 6. Out of Scope (for now)

- Full admin auth (login, sessions) – simple password or secret-in-URL is enough for small team
- Manual door-sale form (Venmo/cash) – can add later if needed
- QR auto-generation in app – manual QR creation is fine
