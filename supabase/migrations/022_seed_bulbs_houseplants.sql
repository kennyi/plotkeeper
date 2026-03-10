-- Migration 022: Seed plant library — Freesia, Canna, Ixia (bulbs) + Dracaena Fragrans (houseplant/shrub)
-- Calibrated for Kildare, Ireland (last frost ~April 20, first frost ~October 30)
-- Month numbers: 1=January through 12=December (1-indexed)

-- ────────────────────────────────────────────────────────────
-- BULBS — Freesia, Canna, Ixia
-- ────────────────────────────────────────────────────────────
-- For bulbs/corms/rhizomes:
--   sow_indoors_*  = when to start/chit indoors in pots
--   sow_outdoors_* = when to plant corms/rhizomes directly outdoors
--   transplant_*   = when to plant out pot-started bulbs
--   harvest_*      = flowering / harvest window

INSERT INTO plants (
  name, latin_name, category, subcategory, description,
  sow_indoors_start, sow_indoors_end,
  sow_outdoors_start, sow_outdoors_end,
  transplant_start, transplant_end,
  harvest_start, harvest_end,
  weeks_indoors_min, weeks_indoors_max,
  spacing_cm, row_spacing_cm, sowing_depth_cm,
  height_cm_min, height_cm_max,
  sun_requirement, water_needs, soil_preference,
  hardiness_zone, frost_tolerant, frost_tender, slug_risk,
  is_cut_flower, vase_life_days, succession_sow,
  companion_plants, avoid_near,
  common_pests, common_diseases,
  notes, growing_tips
) VALUES

-- FREESIA
('Freesia', 'Freesia spp.', 'bulb', 'cut_flower',
 'Intensely fragrant corms from South Africa. Star cut flower for the polytunnel or sheltered sunny border. Jewel-coloured in white, yellow, orange, pink, purple, and red.',
 1, 2,       -- start corms indoors Jan–Feb for early polytunnel flowers
 4, 5,       -- plant directly outdoors Apr–May after frost risk
 NULL, NULL, -- (use sow_outdoors for direct planting)
 6, 8,       -- flowers Jun–Aug (outdoor); May–Jul under glass
 6, 8,       -- weeks to start before planting out
 7, 10, 5.0,
 30, 45,
 'full_sun', 'medium', 'well-drained, sandy loam',
 'H2', false, true, 'low',
 true, 10, false,
 ARRAY['sweet pea', 'rose'], ARRAY['none'],
 ARRAY['aphid', 'thrips'], ARRAY['fusarium wilt', 'botrytis'],
 'Plant corms indoors in January–February for polytunnel flowers from May. Alternatively plant directly outdoors April–May after last frost. Lift corms before October frost and store dry and frost-free over winter.',
 'Fragrance varies enormously by variety — buy named cultivars. Superb vase life (10+ days). Double varieties often less fragrant. Excellent in a polytunnel for earlier, more reliable flowers in Kildare.'),

-- CANNA
('Canna', 'Canna spp.', 'bulb', 'tropical',
 'Bold tropical rhizome with lush paddle-shaped foliage and vivid flowers in orange, red, pink, and yellow. A dramatic statement plant for warm sheltered spots.',
 2, 3,       -- start rhizomes indoors in pots Feb–Mar at 18°C+
 NULL, NULL, -- never direct-sow outdoors in Kildare
 5, 6,       -- plant out late May–Jun after last frost
 7, 10,      -- flowers Jul–Oct
 8, 12,
 60, 60, 10.0,
 60, 180,
 'full_sun', 'high', 'rich, moisture-retentive, humus-rich',
 'H2', false, true, 'medium',
 true, 5, false,
 ARRAY['none'], ARRAY['none'],
 ARRAY['caterpillar', 'slugs', 'earwig'], ARRAY['canna rust', 'mosaic virus', 'botrytis'],
 'Start rhizomes in pots at 18°C+ from February–March. Plant out after last frost (late May in Kildare). Must lift rhizomes before October frost and store dry and frost-free. Inspect for rot before storing.',
 'Feed fortnightly with high-potash feed once in active growth. Stake tall varieties in exposed spots. Wyoming (orange), Tropicanna, and Durban are reliable in Ireland. Remove spent flower spikes to keep tidy. Cannas love warmth and moisture.'),

-- IXIA
('Ixia', 'Ixia spp.', 'bulb', 'cut_flower',
 'Delicate star-shaped flowers on slender wiry stems in vivid reds, pinks, oranges, yellows, and white. A South African corm underused in Irish gardens but superb for cutting.',
 2, 3,       -- start corms indoors Feb–Mar for earlier flowers
 3, 4,       -- plant corms directly outdoors Mar–Apr in warm spot
 NULL, NULL,
 5, 6,       -- flowers May–Jun
 4, 6,
 10, 15, 7.0,
 30, 50,
 'full_sun', 'low', 'very well-drained, sandy',
 'H2', false, true, 'low',
 true, 7, false,
 ARRAY['allium', 'tulip'], ARRAY['none'],
 ARRAY['aphid', 'thrips'], ARRAY['corm rot', 'botrytis'],
 'Plant corms March–April in the warmest, most sheltered spot with very sharp drainage. After foliage dies back lift corms and store dry over winter — Kildare winters are too wet for reliable in-ground overwintering. Can also be grown year-round in a cold greenhouse.',
 'Brilliant for cutting and arranging — slice stems at an angle and condition overnight before arranging. Mixed hybrid packs give the widest colour range. Worth trialling in a polytunnel for earlier May flowers. Needs excellent drainage above all else to avoid corm rot.');

-- ────────────────────────────────────────────────────────────
-- SHRUB / INDOOR — Dracaena Fragrans (Corn Plant)
-- ────────────────────────────────────────────────────────────

INSERT INTO plants (
  name, latin_name, category, subcategory, description,
  -- no sowing/planting windows — propagated by stem cuttings / air layering
  -- sow_* and transplant_* left NULL
  -- can be moved outdoors in sheltered spot June–August
  height_cm_min, height_cm_max,
  sun_requirement, water_needs, soil_preference,
  hardiness_zone, frost_tolerant, frost_tender, slug_risk,
  is_cut_flower, is_perennial, lifespan_years,
  companion_plants, avoid_near,
  common_pests, common_diseases,
  notes, growing_tips
) VALUES

('Dracaena Fragrans', 'Dracaena fragrans', 'shrub', 'indoor',
 'The classic Corn Plant. A slow-growing tropical houseplant with bold, strap-shaped arching leaves and a cane-like woody stem. Occasional clusters of intensely fragrant white flowers may appear on mature plants.',
 50, 200,
 'partial_shade', 'medium', 'well-drained, peat-free multipurpose compost',
 'H1a', false, true, 'low',
 false, true, NULL,
 ARRAY['none'], ARRAY['none'],
 ARRAY['spider mite', 'mealybug', 'scale insect'], ARRAY['root rot', 'leaf tip burn'],
 'Strictly a houseplant or heated glasshouse plant in Ireland — damaged below 10°C and killed by frost. Can be moved to a sheltered patio June–August in warm summers but must come back indoors before temperatures drop. Will not tolerate outdoor conditions in Kildare.',
 'Allow the top 2–3cm of compost to dry out between waterings — overwatering is the main killer. Brown leaf tips indicate fluoride sensitivity: use rainwater rather than tap water and avoid compost with added phosphate. Tolerates low light but grows better in bright indirect light. Feed monthly May–September with a balanced liquid feed. Wipe leaves occasionally to remove dust and improve light absorption.');
