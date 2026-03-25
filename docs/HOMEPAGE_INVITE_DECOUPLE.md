# Homepage / invite decouple — checklist

Branch: `homepage-invite-decouple` (from current `main`).

Goal: `/` is a general Midnight Teahouse homepage (no past “Crossing into Spring” ticket flow). Full reservation flow lives on a dedicated route (e.g. `/invite`) so it can be reused for future events.

---

## Phase 1 — Routing

- [x] **Move full invite page to `/invite`** — `app/invite/page.tsx` renders `CarrdStylePage` + availability + `ticket` query.

- [x] **Replace `app/page.tsx`** — Marketing home + `SiteFooter`; CTAs to `/invite` and `/our-story`.

- [x] **Door / admin links** — `generate-link` already used `/invite?ticket=...`; internal links updated (`our-story`, `gatherings`, `success`, nav).

- [x] **E2E / tests** — No change needed; tests already expect `/invite?ticket=`.

- [x] **Legacy queries on `/`** — `/?ticket=…` and dev `/?mock=…` redirect to `/invite?…`.

---

## Phase 2 — Copy & branding (homepage vs invite)

- [x] **Remove “Crossing into Spring” from the new home** (new `/` has no event title; invite unchanged).

- [ ] **Centralize event title where possible**  
  - Hardcoded strings today (non-exhaustive): `carrd-style-page.tsx`, `event-invite-wizard.tsx`, checkout description, `invite/success` share text, some emails.  
  - **Do:** Either a small `eventTitle` (or similar) in `content/event-invite.config.ts` / env, or keep hardcoded only on invite/success/checkout paths — not on the new home.

---

## Phase 3 — Stripe & ops

- [ ] **Checkout success URL**  
  - `app/api/checkout/route.ts`: confirm `success_url` still points to `/invite/success?...` (or update if you move success).

- [ ] **Stripe Dashboard**  
  - If any redirect URLs were manually set to `/`, update to `/invite` where appropriate.

- [x] **Printed QR / old links** — `/?ticket=…` redirects to `/invite` (see Phase 1).

---

## Phase 4 — Optional follow-ups

- [x] Redirect `/?ticket=...` → `/invite?ticket=...` (implemented in `app/page.tsx`).
- [ ] Archive page: static route for “Crossing into Spring” recap (no checkout).
- [ ] `NEXT_PUBLIC_TICKETING_ENABLED` or feature flag to hide CTA to `/invite` without removing the route.

### Later (does not block Phase 1)

- **Past events section:** e.g. `/events` list + per-event pages (or MDX). Homepage can link there when ready; keep **live ticketing** on `/invite` (or a future `/events/current`) so marketing URLs stay stable.

---

## Verify before merge

- [ ] `/` loads new home; no full ticket wizard on root.
- [ ] `/invite` shows full Carrd + reservation flow; `?ticket=` door flow works.
- [ ] Admin “generate link” opens correct URL.
- [ ] Test checkout (test mode) completes and lands on success page.
- [ ] `pnpm build` passes.
