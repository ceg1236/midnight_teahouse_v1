# Capacity Configuration

Capacity (max tickets per date) can be edited from the admin page. No code deploy needed.

## Setup

1. Go to **`/admin`** → Capacity tab
2. Adjust capacity per date
3. Click **Save**

On first save, a **Config** sheet tab is created in your spreadsheet (same spreadsheet as sales data). Columns: `DateId` | `Capacity`.

## Fallback

If the Config sheet doesn't exist or has no data, the app uses defaults from `event-invite.config.ts` (45 per date).
