# Homepage / invite decouple — checklist

Branch: `homepage-invite-decouple` (from current `main`).

Goal: `/` is a general Midnight Teahouse homepage (no past “Crossing into Spring” ticket flow). Full reservation flow lives on a dedicated route (e.g. `/invite`) so it can be reused for future events.

---

## Phase 1 — Routing

- [ ] **Move full invite page to `/invite`**  
  - Today: `app/page.tsx` renders `CarrdStylePage` + availability + `initialTicket`.  
  - Today: `app/invite/page.tsx` redirects to `/` with search params.  
  - **Do:** Put the invite server logic (dynamic, `getAvailability`, `soldOutByDateId`, `searchParams`) in `app/invite/page.tsx` and render `CarrdStylePage` there. Remove the redirect-only behavior.

- [ ] **Replace `app/page.tsx`**  
  - New lightweight home: hero, short blurb, links to Our Story, Gatherings/blog as needed, and a primary CTA to **Get tickets → `/invite`** (or final path you choose).  
  - Reuse shared layout / header / footer if the site has them.

- [ ] **Door / admin links**  
  - `app/api/admin/generate-link/route.ts`: ensure generated URLs use `/invite?ticket=...` (not `/?ticket=...`).  
  - Confirm `app/invite/page.tsx` reads `ticket` query the same way root did.

- [ ] **E2E / tests**  
  - `e2e/door-link.spec.ts` and `app/api/admin/generate-link/__tests__/route.test.ts`: update expectations if they assumed `/invite` redirects to `/`.

---

## Phase 2 — Copy & branding (homepage vs invite)

- [ ] **Remove “Crossing into Spring” from the new home**  
  - Only the invite route should show the event title / countdown / tier UI tied to `event-invite.config.ts`.

- [ ] **Centralize event title where possible**  
  - Hardcoded strings today (non-exhaustive): `carrd-style-page.tsx`, `event-invite-wizard.tsx`, checkout description, `invite/success` share text, some emails.  
  - **Do:** Either a small `eventTitle` (or similar) in `content/event-invite.config.ts` / env, or keep hardcoded only on invite/success/checkout paths — not on the new home.

---

## Phase 3 — Stripe & ops

- [ ] **Checkout success URL**  
  - `app/api/checkout/route.ts`: confirm `success_url` still points to `/invite/success?...` (or update if you move success).

- [ ] **Stripe Dashboard**  
  - If any redirect URLs were manually set to `/`, update to `/invite` where appropriate.

- [ ] **Printed QR / old links**  
  - Document: old `/?ticket=...` may 404 or land on the wrong page unless you add a **redirect** from `/?ticket=*` → `/invite?ticket=*` on the server (optional but user-friendly).

---

## Phase 4 — Optional follow-ups

- [ ] Redirect `/?ticket=...` → `/invite?ticket=...` (middleware or `page.tsx` on `/`).
- [ ] Archive page: static route for “Crossing into Spring” recap (no checkout).
- [ ] `NEXT_PUBLIC_TICKETING_ENABLED` or feature flag to hide CTA to `/invite` without removing the route.

---

## Verify before merge

- [ ] `/` loads new home; no full ticket wizard on root.
- [ ] `/invite` shows full Carrd + reservation flow; `?ticket=` door flow works.
- [ ] Admin “generate link” opens correct URL.
- [ ] Test checkout (test mode) completes and lands on success page.
- [ ] `pnpm build` passes.
