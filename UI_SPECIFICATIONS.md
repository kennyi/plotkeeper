# PlotKeeper — UI Specifications

## Design Principles

- **Mobile-friendly:** Responsive layout, usable on a phone browser in the garden
- **Earthy, calm palette:** Greens, browns, creams — not clinical or tech-looking
- **Information dense but scannable:** Dashboard should answer "what do I do today?" at a glance
- **Progressive disclosure:** Show the important stuff first, detail on demand

## Colour Palette (Tailwind)

```
Primary green:  green-700 / green-800
Accent:         amber-600 (warnings, highlights)
Background:     stone-50 / stone-100
Cards:          white with stone-200 border
Text:           stone-800 (primary), stone-500 (secondary)
Danger:         red-600
Success:        green-500
```

---

## Navigation

**Sidebar (desktop) / Bottom nav (mobile):**

```
🌱 Dashboard
📅 Calendar
🌿 My Beds
🔍 Plant Library
📋 Monthly Jobs
📓 Journal         (Phase 3)
⚙️  Settings
```

---

## Pages

---

### 1. Dashboard (`/dashboard`)

**Purpose:** "What should I be doing right now?"

**Layout:**
```
┌─────────────────────────────────────────┐
│  🌱 PlotKeeper          March 2026       │
│  Kildare · Spring is coming             │
├─────────────────────────────────────────┤
│  THIS MONTH'S FOCUS                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ 🌱 Sow  │  │ 🪴 Plant│  │ 🌾 Harvest│ │
│  │  4 jobs │  │  2 jobs │  │  1 job  │ │
│  └─────────┘  └─────────┘  └─────────┘ │
├─────────────────────────────────────────┤
│  TOP JOBS THIS MONTH                    │
│  ● Sow onions and leeks indoors   HIGH  │
│  ● Order remaining seed packets   HIGH  │
│  ● Chit seed potatoes             MED   │
│  ● Check overwintering plants     MED   │
│  → View all March jobs                  │
├─────────────────────────────────────────┤
│  WHAT TO SOW THIS MONTH                 │
│  Indoors/Greenhouse                     │
│  [Onion] [Leek] [Celery] [Tomato*]      │
│  * = start only if you have heat        │
│  Outdoors (direct)                      │
│  [Broad Bean] [Peas] [Garlic]           │
├─────────────────────────────────────────┤
│  MY BEDS AT A GLANCE                    │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ Bed 1       │  │ Bed 2       │       │
│  │ Raised · 2m²│  │ Raised · 3m²│       │
│  │ 🌿 3 plants │  │ Empty       │       │
│  └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────┤
│  ⚠️  WEATHER ALERTS  (Phase 3)          │
│  Frost risk Thursday — protect tender   │
│  plants overnight                       │
│  🐌 Slug alert — rain forecast Fri–Sat  │
└─────────────────────────────────────────┘
```

**Components:**
- `MonthHeader` — current month, season label, Kildare weather snapshot
- `JobSummaryCards` — count of jobs by type (sow / plant / harvest / other)
- `TopJobsList` — top 4–5 priority jobs with category badge
- `SowThisMonthSection` — plants to sow this month from plant library
- `BedSnapshot` — card grid of all beds with at-a-glance status
- `WeatherAlerts` (Phase 3) — frost/slug warnings

---

### 2. Planting Calendar (`/calendar`)

**Purpose:** Full month-by-month view of what to sow, plant, and harvest.

**Layout:**
```
┌──────────────────────────────────────────┐
│  Planting Calendar                       │
│  [ ← ] [ March 2026 ] [ → ]             │
│  [ All ] [ Vegetables ] [ Flowers ] [ Herbs ] │
├──────────────────────────────────────────┤
│  🌱 SOW INDOORS / GREENHOUSE (8)         │
│  ┌────────────────────────────────────┐  │
│  │ 🍅 Tomato                          │  │
│  │ Start: Feb–Apr · Plant out: May–Jun│  │
│  │ 6–8 weeks indoors · 7-14 day germ  │  │
│  │ Frost tender — wait until May      │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ 🧅 Onion                           │  │
│  │ Start: Jan–Mar · Plant out: Apr–May│  │
│  │ 10–12 weeks indoors                │  │
│  └────────────────────────────────────┘  │
│  ... more                                │
├──────────────────────────────────────────┤
│  🌿 SOW OUTDOORS / DIRECT (3)            │
│  ...                                     │
├──────────────────────────────────────────┤
│  🪴 PLANT OUT / TRANSPLANT (2)           │
│  ...                                     │
├──────────────────────────────────────────┤
│  🌾 HARVEST (2)                          │
│  ...                                     │
├──────────────────────────────────────────┤
│  ✂️  PRUNE / DIVIDE (1)                  │
│  ...                                     │
└──────────────────────────────────────────┘
```

**Features:**
- Month navigation (previous/next arrows)
- Filter tabs: All / Vegetables / Flowers / Herbs / Perennials
- Each plant card shows: name, action dates, weeks indoors, germination time, key notes
- Clicking a plant card opens the full plant detail page
- "Add to my beds" shortcut on each card

---

### 3. My Beds (`/beds`)

**Purpose:** Manage all garden beds and track what's planted in each one.

**Beds Overview:**
```
┌──────────────────────────────────────────┐
│  My Beds                   [+ Add Bed]   │
│                                          │
│  RAISED BEDS (3)                         │
│  ┌──────────────┐  ┌──────────────┐      │
│  │ Raised Bed 1 │  │ Raised Bed 2 │      │
│  │ 2.4m × 0.9m  │  │ 1.8m × 0.9m │      │
│  │ Full sun     │  │ Part shade   │      │
│  │ ● Leeks (R1) │  │ Empty        │      │
│  │ ● Onions(R2) │  │              │      │
│  │ 2 plantings  │  │              │      │
│  │ [View] [Edit]│  │ [View] [Edit]│      │
│  └──────────────┘  └──────────────┘      │
│                                          │
│  POTS & PLANTERS (5)                     │
│  ┌──────────────┐  ...                   │
│  │ Step Pot 1   │                        │
│  │ 40cm × 40cm  │                        │
│  │ ● Herbs      │                        │
│  └──────────────┘                        │
└──────────────────────────────────────────┘
```

**Bed Detail (`/beds/[id]`):**
```
┌──────────────────────────────────────────┐
│  ← Back     Raised Bed 1          [Edit] │
│  2.4m × 0.9m = 2.16m²  ·  Full sun      │
│  Soil: Homemade compost mix              │
│  Section: Vegetables                     │
├──────────────────────────────────────────┤
│  CURRENT PLANTINGS              [+ Add]  │
│  ┌────────────────────────────────────┐  │
│  │ Row 1 · Leeks (25 plants)          │  │
│  │ Started: Feb 3 · Out: Apr 15       │  │
│  │ Status: ● Growing                  │  │
│  │ [Mark harvested] [Notes] [Remove]  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Row 2 · Onions (30 plants)         │  │
│  │ Started: Jan 28 · Out: May 1       │  │
│  │ Status: ● Seeds started            │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  HISTORY (previous years)               │
│  2025: Tomatoes · Courgettes            │
│  2024: Brassicas                        │
├──────────────────────────────────────────┤
│  SPACING GUIDE                          │
│  2.4m width ÷ 20cm spacing = 12 plants │
│  per row (approx)                       │
└──────────────────────────────────────────┘
```

**Add Bed Form fields:**
- Name (text)
- Type (raised bed / ground bed / pot / planter / etc.)
- Length (m), Width (m), Depth (m) — optional for pots
- Sun exposure (full sun / partial shade / full shade)
- Wind exposure (sheltered / moderate / exposed)
- Soil type (text)
- Section (vegetable / flowers / herbs / mixed)
- Notes

---

### 4. Plant Library (`/plants`)

**Purpose:** Browse and search all plants with full growing info.

```
┌──────────────────────────────────────────┐
│  Plant Library                           │
│  [Search plants...]                      │
│  [ All ] [ Veg ] [ Flowers ] [ Herbs ]   │
│  [ Perennials ] [ Cut flowers ]          │
├──────────────────────────────────────────┤
│  VEGETABLES (35)                         │
│  ┌────────────┐ ┌────────────┐           │
│  │ 🍅 Tomato  │ │ 🧅 Onion   │           │
│  │ Annual     │ │ Annual     │           │
│  │ Sow Feb-Apr│ │ Sow Jan-Mar│           │
│  │ 🐌 High    │ │ 🐌 Low     │           │
│  └────────────┘ └────────────┘           │
└──────────────────────────────────────────┘
```

**Plant Detail (`/plants/[id]`):**
- Full sowing/planting/harvest calendar
- Germination info (days, temperature)
- Spacing and depth guide
- Frost/slug risk
- Companion planting (good/bad neighbours)
- Common pests
- Growing tips
- "Add to bed" button

---

### 5. Monthly Jobs (`/jobs`)

**Purpose:** Full list of gardening tasks for the current month (and ability to browse other months).

```
┌──────────────────────────────────────────┐
│  Monthly Jobs                            │
│  [ ← ] [ March ] [ → ]                  │
│  [ All ] [ Veg ] [ Flowers ] [ General ] │
├──────────────────────────────────────────┤
│  HIGH PRIORITY                           │
│  ☐ Sow onions and leeks indoors     SOW  │
│    Aim for module trays, 2-3 seeds       │
│    per cell. Heated propagator if poss.  │
│  ☐ Order remaining seed packets   ORDER  │
│    Check what you have, order rest now   │
│                                          │
│  MEDIUM PRIORITY                         │
│  ☐ Chit seed potatoes             PREP   │
│  ☐ Check stored bulbs for rot    MAINT   │
│  ☐ Apply compost to empty beds   PREP    │
│                                          │
│  LOW PRIORITY                            │
│  ☐ Tidy greenhouse                MAINT  │
│                                          │
│  [+ Add custom job for March]            │
└──────────────────────────────────────────┘
```

**Features:**
- Checkbox to mark jobs done (saves done state for the year)
- Month navigation
- Filter by category
- Add custom job for any month
- Done jobs appear struck through at bottom

---

### 6. Settings (`/settings`)

```
┌──────────────────────────────────────────┐
│  Settings                                │
│                                          │
│  Garden Name:     [My Kildare Garden   ] │
│  Location:        [Kildare, Ireland    ] │
│  Hardiness Zone:  [H4-H5              ] │
│  Last Frost:      [~April 15          ] │
│  First Frost:     [~October 30        ] │
│  Total Garden Area: [__] m²             │
│                                          │
│  Soil Type (default): [____________    ] │
│                                          │
│  [Save Settings]                         │
└──────────────────────────────────────────┘
```

---

### 7. Journal (`/journal`) — Phase 3

**Purpose:** Log harvests, observations, problems, purchases.

```
┌──────────────────────────────────────────┐
│  Journal                      [+ Entry] │
│  [ All ] [ Harvest ] [ Problem ] [ Note ]│
├──────────────────────────────────────────┤
│  March 3, 2026                           │
│  🌾 Harvest · Raised Bed 1 · Leeks       │
│  "First leeks of the year — 8 pulled,   │
│  about 400g. Bit thin but edible"        │
│                                          │
│  February 28, 2026                       │
│  🐌 Problem · Raised Bed 2               │
│  "Slug damage on overwintering spinach"  │
│  Diagnosis: Slugs · Treatment: Pellets  │
└──────────────────────────────────────────┘
```

---

## Component Library

All built with shadcn/ui as the base:

| Component | Used for |
|---|---|
| `Card` | Bed cards, plant cards, job items |
| `Badge` | Category tags, status indicators, priority labels |
| `Button` | All CTAs |
| `Dialog` | Add bed form, add planting form |
| `Select` | Month picker, category filter |
| `Input` | Search, form fields |
| `Checkbox` | Job completion |
| `Tabs` | Filter tabs on calendar and library |
| `Separator` | Section dividers |
| `Sheet` | Mobile navigation drawer |
| `Tooltip` | Plant info snippets on hover |

---

## Responsive Behaviour

- **≥1024px (desktop):** Sidebar nav, multi-column card grids, full detail views
- **768–1024px (tablet):** Collapsed sidebar, 2-column grids
- **<768px (mobile):** Bottom tab nav, single column, cards stack vertically, forms go full-screen modal
