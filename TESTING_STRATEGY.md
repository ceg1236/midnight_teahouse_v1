# Testing Strategy: Midnight Teahouse

## Pre-Merge Checklist (Live Site)

Before merging any PR when the site is live and accepting payments:

- [ ] **Build passes** – `pnpm build` succeeds
- [ ] **Tests pass** – `pnpm test` succeeds
- [ ] **No payment code changed** – If checkout, webhook, or Stripe logic changed, do a test payment first
- [ ] **Preview deploy** – If Vercel creates a preview URL, smoke-test the critical path there
- [ ] **Scope of changes** – Low-risk (docs, copy, UI tweaks) vs high-risk (API, webhook, Stripe)

---

## Running Tests

```bash
pnpm test          # Unit + API tests (Vitest)
pnpm test:watch    # Vitest watch mode
pnpm test:e2e      # E2E tests (Playwright) - run `pnpm dev` in another terminal first
pnpm test:e2e:install  # First-time: install Chromium browser for Playwright
pnpm test:e2e:ui   # Playwright UI mode
```

---

## Test Coverage

| Layer | What | Status |
|-------|------|--------|
| **Checkout API** | Validation, rate limit, Stripe mock | ✅ |
| **Rate limiter** | Under limit, over limit | ✅ |
| **Webhook** | Signature, metadata, Sheets mock | ✅ |
| **E2E** | Smoke, reservation flow | ✅ |

---

## Critical Paths

### Checkout API (`/api/checkout`)
- Rejects invalid `dateId`, missing `name`/`email`, invalid `items`
- Rejects `items` with quantity > 4 or total > 4
- Rejects Supported price outside $20–40
- Returns 429 when rate limited
- Returns Stripe URL when valid

### Rate Limiter (`lib/rate-limit`)
- Allows requests under limit
- Blocks after 5 requests per IP per minute

### Webhook (`/api/webhooks/stripe`)
- 500 when not configured, 400 for invalid signature
- 200 for valid checkout.session.completed (mocked Sheets/Resend)
- Idempotency: skips duplicate payment IDs

### E2E (Playwright)
- Homepage loads, Reserve button visible, Our Story link
- Reservation flow: date → ticket → form (no Stripe)

---

## Confirmation Email (Dev)

Preview and test the confirmation email without going through checkout:

| Action | How |
|--------|-----|
| **Preview layout** | Open `http://localhost:3000/api/email-preview` in browser. Add `?name=Jordan&orderSummary=2+×+Community+$40` to customize. |
| **Send test email** | `curl -X POST http://localhost:3000/api/email-test -H "Content-Type: application/json" -d '{"to":"you@example.com"}'` (dev only; requires `RESEND_API_KEY` in `.env`) |
