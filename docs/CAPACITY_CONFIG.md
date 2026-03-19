# Capacity Configuration

Capacity (max tickets per date) is controlled by a **Config** tab in your spreadsheet. Edit it directly in the sheet; no admin portal.

## Config Sheet Format

Same spreadsheet as payment data. Add a tab named **Config**:

| A (DateId) | B (Capacity) |
|------------|--------------|
| mar-18     | 45           |
| mar-19     | 55           |
| mar-20     | 45           |

- **Row 1**: Header (`DateId`, `Capacity`)
- **Row 2+**: One row per date. DateId must match `event-invite.config.ts` (e.g. `mar-18`, `mar-19`, `mar-20`). Case-insensitive.
- **Column A**: DateId
- **Column B**: Capacity (number)

The app reads `Config!A2:B` (data rows only).

## Fallback

If the Config tab doesn't exist or has no valid rows, the app uses defaults from `event-invite.config.ts` (45 per date).

## Setup

1. In your spreadsheet (same one as payment data), add a tab named **Config**
2. Row 1: `DateId` in A1, `Capacity` in B1
3. Row 2+: Add one row per date with the correct DateId and capacity number
4. Save. Changes take effect on the next page load.
