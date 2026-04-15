# Local Stripe + Test Sheet Flow

Use this when you want to test checkout/webhooks locally without touching production Stripe or production Sheets.

## 1) Local env setup

In `.env.local` set:

```bash
PAYMENT_ENV=test

TEST_STRIPE_SECRET_KEY=sk_test_...
TEST_STRIPE_WEBHOOK_SECRET=whsec_...

TEST_SPREADSHEET_ID=...
TEST_PAYMENTS_SHEET_NAME=Sheet1

# if needed (optional if your default creds can access the test sheet)
TEST_GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
# or:
# TEST_GOOGLE_APPLICATION_CREDENTIALS=./secrets/google-credentials-test.json
```

## 2) Start app + Stripe listener

In one terminal:

```bash
pnpm dev
```

In another terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` shown by Stripe CLI into `TEST_STRIPE_WEBHOOK_SECRET`.

## 3) Run a local checkout test

Open:

- `http://localhost:3000/events/erstwhere-04-26` (new event path), or
- `http://localhost:3000/invite` (legacy event path).

Complete checkout with Stripe test card `4242 4242 4242 4242`.

## 4) Verify expected outcomes

- Stripe test payment succeeds.
- Stripe webhook delivery shows success.
- A new row is added to the **test** sheet (from `TEST_SPREADSHEET_ID`).
- Confirmation email sends (Resend uses your normal env vars).
