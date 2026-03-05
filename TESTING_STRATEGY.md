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
pnpm test          # Run all tests once
pnpm test:watch    # Run tests in watch mode
```

---

## Test Coverage

| Layer | What | Status |
|-------|------|--------|
| **Checkout API** | Validation, rate limit, Stripe mock | ✅ |
| **Rate limiter** | Under limit, over limit | ✅ |
| **Webhook** | (Phase 4) | Pending |
| **E2E** | (Phase 5) | Pending |

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
