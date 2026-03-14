# Testing Refund Flow (Dev Only)

Quick way to test refund sheet updates without doing a full checkout + Stripe refund.

**Requires:** `ADMIN_PASSWORD` in `.env.local`, dev server running (`npm run dev`).

---

## 1. Append a test row (tests new row color)

```bash
curl -X POST http://localhost:3000/api/admin/test-append \
  -H "Content-Type: application/json" \
  -d '{"password":"YOUR_ADMIN_PASSWORD"}'
```

Response includes `paymentId` (e.g. `pi_test_1731234567890`). Check the sheet: new row should be **white**.

---

## 2. Simulate refund (tests coral + refund notes)

Use a payment ID from column J (any row in the sheet):

```bash
curl -X POST http://localhost:3000/api/admin/test-refund \
  -H "Content-Type: application/json" \
  -d '{
    "password":"YOUR_ADMIN_PASSWORD",
    "paymentId":"pi_xxx",
    "refundReason":"requested by customer",
    "refundNotes":"Test notes"
  }'
```

- `paymentId` – required. Copy from column J in the sheet.
- `refundReason` – optional.
- `refundNotes` – optional. Tests the Notes column.

Check the sheet: row should be **coral**, K has date, L has reason + notes.

---

## Quick cycle

1. `POST /api/admin/test-append` → get `paymentId`
2. `POST /api/admin/test-refund` with that `paymentId` → verify coral + notes
3. Check Summary formulas exclude the row
4. Repeat as needed (no Stripe checkout required)
