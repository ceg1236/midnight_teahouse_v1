# Reservation Flow TODO

Reference this list as we build. Check off items as they're completed.

**→ Finish remaining payment features (sections 1–6) after UI refactor.**

---

## 1. Data & Payment

- [ ] **Stripe Checkout integration**
  - Create checkout session with form data as `metadata` (name, email, date, tier, notes)
  - Form data only sent on successful payment (metadata is attached to payment)
- [ ] **Spreadsheet as data source** – Google Sheets for ticket holder list (see section 7)
- [x] **Webhook handler** (`checkout.session.completed`)
  - Append row to spreadsheet (timestamp, name, email, ticket date, ticket tier, notes, device, stripe_payment_id)
  - [x] Idempotency – skip if payment ID already in sheet
  - [ ] Add paid attendees to existing email list (CRM API)
  - [ ] Custom event confirmation email (from our domain, via webhook)

---

## 2. Server-Side Validation

- [ ] **API route** (e.g. `POST /api/checkout`) that creates Stripe session
- [ ] Validate before creating session:
  - [ ] Date ID exists in config
  - [ ] Tier ID exists in config
  - [ ] Tier price matches config (prevent tampering)
  - [ ] Name: non-empty, reasonable length
  - [ ] Email: valid format
  - [ ] Capacity check (if implemented)

---

## 3. Confirmation & Communication

- [x] **Stripe receipt** – automatic (payment confirmation)
- [ ] **Custom event confirmation email** – send from our own email (Resend/SendGrid/etc.) from webhook after payment; event-specific welcome, not just Stripe receipt
- [ ] **Email list signup** – add to CRM from webhook after successful payment

---

## 4. Capacity & Sold-Out

- [ ] **Capacity limits** – via spreadsheet:
  - Count rows per date/tier (API call) or maintain a counts range
  - Note: small oversell risk with concurrent payments; acceptable for low volume
- [ ] **Sold-out UI** – disable or hide unavailable dates/tiers and show "sold out" state
- [ ] **Re-check availability** before creating checkout session

---

## 5. Reliability & UX

- [ ] **Loading states** – show spinner during submit and payment redirect
- [ ] **Error handling** – show clear messages on network/API/Stripe failures
- [ ] **Double-submit prevention** – disable button after click, consider idempotency key
- [x] **Session persistence** – save date/tier/form to `sessionStorage`; restore on back from Stripe; clear on success page

---

## 6. Monitoring & Safety

- [ ] **Error tracking** – Sentry or similar
- [ ] **Logging** – log attempts, successes, failures (no sensitive data)
- [x] **Rate limiting** – 5 requests/min per IP on checkout

---

## Build Order

1. Spreadsheet setup (Google Sheet + service account)
2. API route for checkout + server-side validation
3. Stripe Checkout integration + metadata
4. Webhook handler → append to spreadsheet + email list signup
5. Loading states, error handling, double-submit prevention
6. Capacity limits + sold-out handling
7. Custom event confirmation email (from our domain)
8. Monitoring

---

## 7. Spreadsheet Data Source (Google Sheets)

- [x] **Setup**
  - Sheet created, shared with service account (Editor)
  - Column order: `Timestamp` | `Name` | `Email` | `Ticket date` | `Ticket tier` | `Notes` | `Device` | `Stripe Payment ID`
  - Ticket date = date label (e.g. "Wednesday, March 18"); Ticket tier = tier label (e.g. "Community")
  - Device = mobile | tablet | desktop (from form)
- [x] **Write pattern** – append-only from webhook (one row per successful payment)
- [ ] **Security** – server-only access, never expose sheet ID or credentials to client
- [ ] **Rate limits** – ~100 writes/100 sec (fine for small events)
- [ ] **Backup** – use version history; periodic export to CSV
- [ ] **When to graduate** – consider DB if: many concurrent payments, strict capacity, or multiple events

---

## 8. UI Refactor (Event Invite)

- [x] **Remove vertical images** – Remove flanking flower/plant images from welcome step (desktop and mobile thumbnails)
- [x] **Hero video** – Add `midnight_site_vid_hi_res.mp4` / `.mov` as full-viewport hero (Option A), mp4 for Chrome/Firefox/Edge, mov fallback for Safari
- [x] **Typography** – Spring Fling title → Source Sans 3, paragraph → Roboto
- [x] **Scrolling flow** – Single-page scroll; Reserve scrolls to date → tier → form → payment

---

## 9. Cross-Browser Testing

- [ ] **UI & features** – Test across browsers before launch:
  - [ ] Chrome (desktop + mobile)
  - [ ] Safari (desktop + iOS)
  - [ ] Firefox (desktop)
  - [ ] Edge (desktop)
- [ ] **Hero video** – Verify plays in Chrome, Safari, Firefox, Edge
- [ ] **Reservation flow** – Full flow (date → tier → form → Stripe → success) in each browser
- [ ] **Stripe Checkout** – Redirect and return work in each browser

---

## Config Reference

- Dates: `content/event-invite.config.ts` → `eventDates`
- Tiers: `content/event-invite.config.ts` → `eventTiers`
