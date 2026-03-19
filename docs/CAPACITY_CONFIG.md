# Capacity Configuration

Capacity (max tickets per date) can be edited from the admin page. No code deploy needed.

## Setup

1. Go to **`/admin`** → Capacity tab
2. Adjust capacity per date
3. Click **Save**

On first save, a **Config** sheet tab is created in your spreadsheet (same spreadsheet as sales data). Columns: `DateId` | `Capacity`. DateIds are matched case-insensitively (e.g. `mar-18` or `Mar-18` both work).

## Fallback

If the Config sheet doesn't exist or has no data, the app uses defaults from `event-invite.config.ts` (45 per date).

## Troubleshooting

**Save fails or Config tab not created**

- **Permissions**: The spreadsheet must be shared with your service account email (from `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_CREDENTIALS_JSON`) with **Editor** access. Viewer access is not enough to add a new tab.
- **Credentials**: Ensure `SPREADSHEET_ID`, `GOOGLE_APPLICATION_CREDENTIALS` (or `GOOGLE_CREDENTIALS_JSON`) are set in `.env.local`.
- **Error details**: Failed saves show the error in the admin UI. Check the terminal where `pnpm dev` runs for full stack traces.
- **Manual workaround**: If automatic creation fails, create a tab named **Config** manually in your spreadsheet (same one as payment data). Add a header row: `DateId` in A1, `Capacity` in B1. Then Save from admin will populate the values.
- **Local vs production**: If the webhook runs on Vercel (production) but you test admin on localhost, they use different env (and possibly different spreadsheets). Ensure the spreadsheet in your local `SPREADSHEET_ID` is shared with the service account from `secrets/google-credentials.json`.
