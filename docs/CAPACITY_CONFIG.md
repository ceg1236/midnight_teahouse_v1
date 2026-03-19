# Capacity Configuration

Capacity (max tickets per date) can be edited from the admin page. No code deploy needed.

## Setup

1. Go to **`/admin`** → Capacity tab
2. Adjust capacity per date
3. Click **Save**

On first save, a **Config** sheet tab is created in your spreadsheet (same spreadsheet as sales data). Columns: `DateId` | `Capacity`.

## Fallback

If the Config sheet doesn't exist or has no data, the app uses defaults from `event-invite.config.ts` (45 per date).

## Troubleshooting

**Save fails or Config tab not created**

- **Permissions**: The spreadsheet must be shared with your service account email (from `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_CREDENTIALS_JSON`) with **Editor** access. Viewer access is not enough to add a new tab.
- **Credentials**: Ensure `SPREADSHEET_ID`, `GOOGLE_APPLICATION_CREDENTIALS` (or `GOOGLE_CREDENTIALS_JSON`) are set in `.env.local`.
- **Error details**: Failed saves show the error in the admin UI. Check the terminal where `pnpm dev` runs for full stack traces.
