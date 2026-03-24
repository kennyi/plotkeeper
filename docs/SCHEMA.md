# PlotKeeper — Database Schema

> The authoritative source is `supabase/migrations/` — this file is a quick reference.

## Tables

| Table | Purpose |
|---|---|
| `plants` | Master plant library. Pre-seeded + user-created. `created_by` is null for shared plants, user UUID for personal ones. `forked_from` tracks if a user copy was derived from a shared plant. |
| `garden_beds` | Beds, pots, raised beds, planters. Soft delete via `is_active = false`. |
| `bed_plantings` | What's planted in each bed. Links to `plants` OR uses `custom_plant_name` for unlisted plants. |
| `monthly_jobs` | Monthly task list. `is_custom = false` for pre-seeded jobs. `done_year` tracks completion year. |
| `journal_entries` | Log entries. Types: `harvest`, `observation`, `problem`, `note`, `weather`, `purchase`. Optional FK to bed and plant. |
| `garden_settings` | Key-value config store. Keys: `location_name`, `latitude`, `longitude`, `hardiness_zone`, `last_frost_approx`, `first_frost_approx`, `garden_name`, `owner_name`. |
| `tools` | Tool inventory. Migration exists, no UI yet. |
| `planting_task_events` | Every care action logged: `watered`, `fed`, `pruned`, `harvested`, `hardened_off`, `transplanted`. Used by smart task generation. |
| `custom_tasks` | User-created one-off tasks with optional due date. |
| `planting_health_logs` | Timestamped health observations per planting. |
| `bed_photos` | Photos attached to beds. `is_profile` marks the cover image. |
| `planting_photos` | Photos attached to plantings. `is_profile` marks the cover image. |
| `app_feedback` | In-app feedback submissions. |

## bed_plantings Status Lifecycle

    planned → seeds_started → germinating → growing → ready → harvested → finished
                                                                        ↘ failed

## Migrations

Files in `supabase/migrations/` are numbered `001` → `025`. Applied to Supabase via the dashboard SQL editor or Supabase MCP tool. Never modify existing migrations — add new ones.
