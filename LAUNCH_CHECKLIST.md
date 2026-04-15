# Launch Checklist: Midnight Teahouse Ticket Sales

Pre-launch checklist and monitoring guide before announcing ticket sales to guests.

---

## Step-by-Step: First Steps

### Step 1: Stripe Dashboard
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com).
2. Toggle **Test mode** OFF (top right) so you're in Live mode.
3. Copy your **Live** keys: Developers → API keys → Publishable key (`pk_live_...`) and Secret key (`sk_live_...`).

### Step 2: Create the Webhook
1. In Stripe: Developers → Webhooks → Add endpoint.
2. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe` (use your real production domain).
3. **Events to send**: Select `checkout.session.completed`.
4. Click **Add endpoint**.
5. Click **Reveal** under "Signing secret" and copy the `whsec_...` value.

### Step 3: Vercel Environment Variables
1. Go to your Vercel project → Settings → Environment Variables.
2. Add each variable below. Use **Production** (and Preview if you want staging to work too).

### Step 4: Deploy and Test
1. Deploy your latest code to Vercel.
2. Run a test payment (see **Testing** section below).
3. Check Stripe, Sheet, and email.

---

## Pre-launch Checklist

### 1. Stripe (Live Mode)
- [ ] **Live keys** – Use `sk_live_...` and `pk_live_...` (not test keys).
- [ ] **Webhook** – Create a webhook in Stripe Dashboard for your production URL:
  - URL: `https://yourdomain.com/api/webhooks/stripe`
  - Event: `checkout.session.completed`
- [ ] **Webhook secret** – Set `STRIPE_WEBHOOK_SECRET` in Vercel to the webhook's signing secret (`whsec_...`).
- [ ] **Test payment** – Run a real test charge (see **Testing** section), confirm it appears in Stripe, and that the webhook fires.

### 2. Vercel Environment Variables
- [ ] **`NEXT_PUBLIC_APP_URL`** – Set to your production domain (e.g. `https://midnighttea.house`) for all environments. This drives Stripe success/cancel redirects.
- [ ] **`STRIPE_SECRET_KEY`** – Live secret key.
- [ ] **`STRIPE_WEBHOOK_SECRET`** – Production webhook signing secret.
- [ ] **`RESEND_API_KEY`** – Production Resend API key.
- [ ] **`RESEND_FROM`** – Verified domain (e.g. `Midnight Teahouse <hello@mail.midnighttea.house>`).
- [ ] **`RESEND_REPLY_TO`** – e.g. `midnight.teahouse.sf@gmail.com`.
- [ ] **`SPREADSHEET_ID`** – Target Google Sheet ID.
- [ ] **`GOOGLE_CREDENTIALS_JSON`** – Service account JSON (single line, no newlines).

### 2b. Local Stripe/Test Sheet Mode (optional, recommended before launch)
- [ ] Set `PAYMENT_ENV=test` in local `.env.local` to force server APIs to use `TEST_*` payment vars.
- [ ] Add `TEST_STRIPE_SECRET_KEY` and `TEST_STRIPE_WEBHOOK_SECRET` for local Stripe CLI and test checkout.
- [ ] Add `TEST_SPREADSHEET_ID` (and optional `TEST_SPREADSHEET_SHEET_NAME`) so test orders never hit production sheets.
- [ ] Add `TEST_GOOGLE_CREDENTIALS_JSON` (or `TEST_GOOGLE_APPLICATION_CREDENTIALS`) if test sheet permissions differ from prod.
- [ ] Keep `RESEND_API_KEY` / `RESEND_FROM` unchanged unless you intentionally want a separate email sender in test mode.

### 3. Resend
- [ ] **Domain** – `mail.midnighttea.house` (or your chosen domain) verified in Resend.
- [ ] **From address** – Matches the verified domain.

### 4. Google Sheets
- [ ] **Sheet** – Sheet exists and has headers in row 1: Timestamp, Name, Email, Ticket date, Ticket type, Amount paid, Quantity, Notes, Device, Stripe Payment ID, Refunded, Refund Notes.
- [ ] **Permissions** – Service account has edit access to the spreadsheet.
- [ ] **Tab name** – Matches `SPREADSHEET_SHEET_NAME` (default `Sheet1`).
- [ ] **Guestlist tab (optional)** – If using door ops tab, set `GUESTLIST_SHEET_NAME` and create headers:
  - A: Timestamp
  - B: Name
  - C: Email
  - D: Ticket date
  - E: Ticket type
  - F: Amount paid
  - G: Quantity
  - H: Notes
  - I: Device
  - J: Stripe Payment ID
  - K: Refunded
  - L: Refund notes
  - M: Checked in (checkbox)
  - N: Checked-in at
  - O: Checked-in notes

### 5. Content
- [ ] **Dates** – `content/event-invite.config.ts` has correct dates and labels.
- [ ] **Capacity** – Each date has `capacity: N` (e.g. 45). Sold count is read from the Google Sheet; dates show "Sold Out" when full.
- [ ] **Tiers & prices** – Supported ($20–40), Community ($40), Supporter ($60) are correct.
- [ ] **Success page** – Address (54 Washburn st) and event details are correct.

### 6. End-to-End Test
- [ ] Reserve a seat → Stripe Checkout → pay with a real card.
- [ ] Confirm redirect to `/invite/success` with correct name/date.
- [ ] Confirm confirmation email arrives.
- [ ] Confirm row appears in Google Sheet.
- [ ] Test on mobile and desktop.

---

## Testing: Small Real Payment Without Changing Tiers

Your tiers are Supported ($20–40), Community ($40), Supporter ($60). The cheapest option on the page is **Supported at $20**.

**Option A: Real $20 test (no code changes)**  
- Select 1× Supported ticket at $20.  
- Complete checkout with your own card.  
- You get a real charge; you can refund it in Stripe Dashboard afterward (Payments → find the payment → Refund).

**Option B: Stripe test mode (no real money)**  
- Use **test** keys (`sk_test_...`, `pk_test_...`) in Vercel.  
- Create a **test** webhook (same URL, but Stripe gives a different `whsec_...` for test mode).  
- Use Stripe test card: `4242 4242 4242 4242`.  
- No real charge; webhook, Sheet, and email all behave the same.  
- When ready for real sales, switch back to live keys and live webhook.

**Option C: Add a temporary $1 test tier**  
- Add a "Test" tier in `content/event-invite.config.ts` at $1.  
- Run a real $1 charge, then remove the tier before announcing.

**Recommendation:** Use Option B first to verify the full flow, then Option A for one real $20 charge before launch. Refund the $20 in Stripe if you like.

---

## Troubleshooting

**Stripe still shows "TEST" link**  
The Stripe dashboard's Test/Live toggle does not control your app. Your app uses whatever key is in **Vercel** → Settings → Environment Variables. If checkout goes to a test session, `STRIPE_SECRET_KEY` is still `sk_test_...`. Change it to your **live** secret key (`sk_live_...`). Redeploy after changing env vars.

---

## Important Notes

| Topic | Note |
|-------|------|
| **Rate limit** | Checkout is limited to 5 requests per IP per minute. Fine for normal use; heavy traffic or shared networks (e.g. offices) may hit it. |
| **Webhook reliability** | Stripe retries failed webhooks. If Sheets or Resend fail, Stripe will retry; check Stripe Dashboard → Developers → Webhooks for failures. |
| **Email failures** | Confirmation email failures do not fail the webhook; payment and sheet write still succeed. Check Vercel logs for `webhook_confirmation_email_failed`. |
| **Refunds** | Refunds are handled in Stripe Dashboard; the sheet is not updated automatically. |
| **Capacity** | Per-date limits in `content/event-invite.config.ts`; sold count from Google Sheet. Dates show "Sold Out" when full; checkout returns 409 if over capacity. |

---

## What to Monitor After Launch

### Daily (First Week)
1. **Stripe Dashboard** – Payments, disputes, failed payments.
2. **Vercel** – Function logs for 500s, rate limits (429), and `webhook_confirmation_email_failed`.
3. **Google Sheet** – New rows match Stripe payments.
4. **Inbox** – Guest questions or "I didn't get my confirmation."

### Weekly
1. **Stripe** – Webhook success rate (Developers → Webhooks).
2. **Resend** – Delivery and bounce rates.
3. **Vercel** – Error rate and any new error patterns.

### Quick Checks
- **Vercel logs**: Project → Logs, filter by `/api/checkout` and `/api/webhooks/stripe`.
- **Stripe webhooks**: Developers → Webhooks → your endpoint → "Recent deliveries".
- **Resend**: Logs for sent/failed emails.

---

## Suggested Announcement Copy

> Tickets for Midnight Teahouse are now live. Reserve your spot at [your-domain]. Doors open at 7pm. We'll send a confirmation email with details. Questions? midnight.teahouse.sf@gmail.com
