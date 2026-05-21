# Capacity Configuration

Capacity is controlled by a **Config** tab in your spreadsheet. Edit it directly in the sheet; no admin portal.

## Config Sheet Format

Same spreadsheet as payment data. Add a tab named **Config**:

| A (DateId) | B (Capacity) | C (TicketType) |
|------------|--------------|----------------|
| May-30 | 45 | |
| May-30 | 6 | tasting |
| mar-18 | 45 | |
| mar-19 | 55 | |
| mar-20 | 45 | |

- **Row 1**: Header (`DateId`, `Capacity`, `TicketType`)
- **Row 2+**: One row per capacity rule. **DateId** can be a short date key (`May-30`, `May 30`) or the internal id (`mar-18`, `turby-may-30`). Case-insensitive.
- **Column A**: DateId
- **Column B**: Capacity (number)
- **Column C**: TicketType (optional)
  - **Invite evenings (no experience step):** leave empty for total event capacity (all ticket types count toward this cap).
  - **Turby (Open Teahouse + Guided Tasting):** leave empty for **standard / Open Teahouse** capacity, or set `standard`. Set **`tasting`** for Guided Tasting seats only. These pools are **independent** — tasting sales do not reduce Open Teahouse capacity and vice versa.

The app reads `Config!A2:C` (data rows only).

### Turby example

| DateId | Capacity | TicketType |
|--------|----------|------------|
| May-30 | 45 | |
| May-30 | 6 | tasting |

- **45** (empty TicketType) = max Open Teahouse guests (Community, Supporter, Supported tiers).
- **6** (`tasting`) = max Guided Tasting seats (Tasting and Supported Tasting both count).

A full Open Teahouse does **not** block tasting sales, and a full tasting session does **not** block Open Teahouse sales.

### What counts toward each pool (Payments / Guestlist col E)

| Pool | Ticket type labels |
|------|-------------------|
| **tasting** | `Tasting`, `Tasting · Supported $X`, legacy `Guided Tasting · …` |
| **standard** | `Community`, `Supporter`, `Supported $X`, etc. (anything that is not tasting) |

## Fallback

If the Config tab doesn't exist or has no valid rows, the app uses defaults from event config (`content/turby-event.config.ts`, etc.): 45 standard / Open Teahouse per date, 6 for tasting on Turby.

## Setup

1. In your spreadsheet (same one as payment data), add or open the **Config** tab
2. Row 1: `DateId` in A1, `Capacity` in B1, `TicketType` in C1
3. Row 2+: Add rows for each capacity rule
4. Save. Changes take effect on the next page load.
