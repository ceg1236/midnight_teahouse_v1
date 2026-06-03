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

One command starts Next.js and `stripe listen` (requires [Stripe CLI](https://stripe.com/docs/stripe-cli)). The dev script reads `.env.local` and passes `TEST_STRIPE_SECRET_KEY` (or `STRIPE_SECRET_KEY`) to the CLI so an expired `stripe login` session does not block the app. If webhook forwarding fails, Next.js still starts — fix the key or run `stripe login` again.

```bash
pnpm dev
```

Phone on the same Wi‑Fi (site must be reachable on your LAN):

```bash
pnpm dev:mobile
```

Use the LAN or `YourMac.local` URL from the terminal — not `localhost` on a physical phone (`localhost` is the phone itself). iOS Simulator on this Mac can use `http://localhost:3000`. Android over USB can use `adb reverse tcp:3000 tcp:3000` then `http://localhost:3000`.

Copy the `whsec_...` shown by Stripe CLI into `TEST_STRIPE_WEBHOOK_SECRET` (first run only, or when it changes).

## 3) Run a local checkout test

Open:

- `http://localhost:3000/erstwhere` (special event path), or
- `http://localhost:3000/invite` (legacy event path).

Complete checkout with Stripe test card `4242 4242 4242 4242`.

## 4) Verify expected outcomes

- Stripe test payment succeeds.
- Stripe webhook delivery shows success.
- A new row is added to the **test** sheet (from `TEST_SPREADSHEET_ID`).
- Confirmation email sends (Resend uses your normal env vars).
