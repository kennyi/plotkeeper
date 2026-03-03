# PlotKeeper — Project Overview

## What Is This?

PlotKeeper is a personal garden management web app built for a year-round, low-maintenance garden in Kildare, Ireland. It combines a planting calendar, seed timing tracker, bed layout manager, and monthly job list into a single dashboard — all pre-loaded with Ireland-specific data (hardiness zones, frost dates, slug seasons, rainfall patterns).

The goal is a self-sustaining garden that comes back year after year, with the app acting as the brain: telling you what to do, when to do it, and tracking what you've done.

---

## Who Is This For?

Personal use only. One user, no authentication required. No multi-tenancy. No accounts.

---

## The Garden

- **Location:** Kildare, Ireland
- **Hardiness Zone:** H4–H5 (RHS scale)
- **Average Last Frost:** Mid-April
- **Average First Frost:** Late October
- **Infrastructure:** Homemade pallet raised beds, planters on steps, pots — with a new house/garden being designed
- **Garden sections:**
  - Vegetable beds (onions, potatoes, tomatoes, leeks, etc.)
  - Cut flower section (year-round, multiple rows/sections)
  - Perennial beds
  - Pots and planters (steps, patio)

---

## Core Problem Being Solved

Gardening knowledge is scattered and seasonal. You forget when to start seeds indoors, when to harden off seedlings, what needs to go where and in what row, what the slug risk is this week, and what you planted in that bed last year. PlotKeeper centralises all of this so the garden practically manages itself.

---

## Key Features (Full Vision)

### Phase 1–2 (MVP)
- **Planting Calendar** — month-by-month view: what to sow indoors, sow outdoors, plant out, harvest. Pre-seeded for Kildare.
- **Seed Timing Tracker** — for each plant: when to start, germination time, when to harden off, when to plant out
- **Bed / Plot Manager** — add and manage raised beds, pots, planters with dimensions and contents
- **Monthly Jobs List** — pre-seeded for Kildare: monthly gardening tasks with categories (sow, prune, feed, protect, etc.)
- **Plant Library** — searchable database of vegetables, flowers, herbs, perennials with full growing info

### Phase 3
- **Weather Integration** — Open-Meteo API for Kildare: frost warnings, slug activity after rainfall
- **Journal & Harvest Log** — log harvests, observations, problems, purchases
- **Companion Planting** — what grows well together, what to avoid
- **Pest Guide** — common Irish garden pests, how to identify and treat

### Phase 4+
- **Visual Garden Grid Designer** — drag-and-drop layout based on real measurements
- **Spacing Calculator** — based on bed dimensions and plant spacing requirements
- **Crop Rotation Tracker** — bed history to avoid planting the same family twice
- **Composting Tracker**
- **Tool Inventory**
- **Google Calendar Sync**
- **Plant Health Diagnosis**

---

## Success Criteria

**v1 is successful when:**
- The dashboard shows the current month's planting jobs and tasks
- You can look up any common Irish vegetable or flower and see when to start seeds, when to plant out, and spacing info
- You can add your garden beds and track what's planted in each one
- The app is deployed on Vercel and usable on a phone browser

---

## Tech Stack Summary

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | None (personal use) |
| Hosting | Vercel |
| Weather | Open-Meteo (free, Phase 3) |

---

## Out of Scope (for now)

- Multi-user / sharing
- Native mobile app (responsive web is sufficient)
- Paid API integrations
- E-commerce / seed ordering
