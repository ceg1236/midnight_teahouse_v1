# Reservation Flow TODO

Reference this list as we build. Check off items as they're completed.

---

## 1. Data & Payment

- [ ] **Stripe Checkout integration**
  - Create checkout session with form data as `metadata` (name, email, date, tier, notes)
  - Form data only sent on successful payment (metadata is attached to payment)
- [ ] **Spreadsheet as data source** – Google Sheets for ticket holder list (see section 7)
- [ ] **Webhook handler** (`checkout.session.completed`)
  - Append row to spreadsheet (timestamp, date, tier, name, email, notes, stripe_payment_id)
  - Add paid attendees to existing email list (CRM API)
  - Optional: custom confirmation email (Stripe sends receipt; we send event-specific welcome)

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

- [ ] **Stripe receipt** – automatic (payment confirmation)
- [ ] **Custom event confirmation** (optional) – send from webhook via Resend/SendGrid/etc.
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
- [ ] **Session persistence** (optional) – save progress to `sessionStorage` so refresh doesn't lose flow

---

## 6. Monitoring & Safety

- [ ] **Error tracking** – Sentry or similar
- [ ] **Logging** – log attempts, successes, failures (no sensitive data)
- [ ] **Rate limiting** – limit reservation attempts per IP or user

---

## Build Order

1. Spreadsheet setup (Google Sheet + service account)
2. API route for checkout + server-side validation
3. Stripe Checkout integration + metadata
4. Webhook handler → append to spreadsheet + email list signup
5. Loading states, error handling, double-submit prevention
6. Capacity limits + sold-out handling
7. Custom confirmation email (optional)
8. Monitoring

---

## 7. Spreadsheet Data Source (Google Sheets)

- [x] **Setup**
  - Sheet created, shared with service account (Editor)
  - Column order: `Timestamp` | `Name` | `Email` | `Ticket tier` | `Notes` | `Stripe Payment ID`
  - Ticket tier = date + tier label (e.g. "Wednesday, March 18 · Community")
- [ ] **Write pattern** – append-only from webhook (one row per successful payment)
- [ ] **Security** – server-only access, never expose sheet ID or credentials to client
- [ ] **Rate limits** – ~100 writes/100 sec (fine for small events)
- [ ] **Backup** – use version history; periodic export to CSV
- [ ] **When to graduate** – consider DB if: many concurrent payments, strict capacity, or multiple events

---

## Config Reference

- Dates: `content/event-invite.config.ts` → `eventDates`
- Tiers: `content/event-invite.config.ts` → `eventTiers`
