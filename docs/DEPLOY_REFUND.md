# Deploy Checklist: Refund Flow

Pre-deploy checklist for the refund processing feature.

---

## Tests

- [x] All tests pass (`npm test -- --run`)

---

## 1. Production Google Sheet

- [ ] **Add columns K and L** after column J (Stripe Payment ID)
  - K = Refunded
  - L = Refund Notes
- [ ] **Header row** – K1: "Refunded", L1: "Refund Notes"
- [ ] **Existing refunded rows** – Manually add refund date (YYYY-MM-DD) to column K for rows already refunded
- [ ] **Summary formulas** – Add `, Sheet1!$K:$K, ""` to all SUMIFS/COUNTIFS that should exclude refunded rows
- [ ] **Sheet tab name** – Matches `SPREADSHEET_SHEET_NAME` in Vercel (default `Sheet1`)

---

## 2. Stripe Webhook

- [ ] **Add `charge.refunded`** to your existing webhook endpoint
  - Stripe Dashboard → Developers → Webhooks → [your endpoint] → Update details
  - Events to send: add `charge.refunded` (keep `checkout.session.completed`)
- [ ] **Webhook secret** – No change; same endpoint, same secret

---

## 3. Vercel Environment Variables

- [ ] **`SPREADSHEET_SHEET_NAME`** – Set if your data sheet tab is not named "Sheet1"
- [ ] All existing vars unchanged (STRIPE_*, SPREADSHEET_ID, GOOGLE_CREDENTIALS_JSON, etc.)

---

## 4. Deploy

- [ ] **Merge** `refund-processing` into main (or your deploy branch)
- [ ] **Push** and let Vercel deploy
- [ ] **Verify** deployment succeeded

---

## 5. Post-Deploy Verification

- [ ] **Availability API** – `GET /api/availability` returns correct sold counts (refunded rows excluded)
- [ ] **Main page** – Sold-out status matches Summary sheet
- [ ] **New payment** – Complete a test checkout; row appears with white background
- [ ] **Refund** – Issue refund in Stripe; row gets date in K, coral background, refund notes in L
- [ ] **Summary** – Formulas exclude refunded rows (should already match API)

---

## Rollback

If issues occur: revert the merge and redeploy. The sheet structure (K, L) is backward compatible; old code will append 10 columns and ignore K/L.
