-- Migration 010: Seed monthly jobs — Kildare, Ireland gardening calendar
-- All 12 months with Ireland-specific tasks
-- Month numbers: 1=January through 12=December

INSERT INTO monthly_jobs (month, title, description, category, plant_category, priority) VALUES

-- ── JANUARY ──────────────────────────────────────────────────────────────────
(1, 'Order seeds and plan the year', 'Review last year, plan crop rotation, and order seeds for the season. Prioritise ordering before popular varieties sell out.', 'order', 'general', 'high'),
(1, 'Check stored bulbs and tubers for rot', 'Inspect dahlias, gladioli, and any stored tubers. Remove any showing soft rot or mould.', 'maintenance', 'general', 'high'),
(1, 'Sow onions and leeks indoors (heated)', 'Sow in a heated propagator or warm windowsill. Onions need 8–10 weeks indoors before planting out.', 'sow_indoors', 'vegetable', 'high'),
(1, 'Chit seed potatoes', 'Stand seed potatoes in egg boxes, rose end up, in a cool frost-free bright place to encourage chitting.', 'prepare', 'vegetable', 'medium'),
(1, 'Clean and sharpen tools', 'Oil blades, sharpen edges on spades and hoes, replace any broken handles.', 'maintenance', 'general', 'low'),
(1, 'Protect brassicas from pigeons', 'Check netting over winter brassicas (kale, cabbage) after storms. Pigeons are hungriest now.', 'protect', 'vegetable', 'medium'),
(1, 'Sow sweet pea indoors', 'Sow in deep pots or toilet roll tubes — sweet peas need deep roots. Heated windowsill or propagator.', 'sow_indoors', 'flower', 'medium'),

-- ── FEBRUARY ─────────────────────────────────────────────────────────────────
(2, 'Sow tomatoes and peppers indoors (heated)', 'Needs a propagator at 18–25°C. Earliest sowings for polytunnel production.', 'sow_indoors', 'vegetable', 'high'),
(2, 'Continue chitting seed potatoes', 'Check chits are developing in cool bright conditions — green shoots 1–2cm long is ideal for planting.', 'prepare', 'vegetable', 'medium'),
(2, 'Direct sow broad beans outdoors', 'Broad beans hardy enough for a February outdoor sowing in Kildare. Protect from mice with a cloche.', 'sow_outdoors', 'vegetable', 'high'),
(2, 'Sow lettuce and salad indoors', 'Start early lettuces under cover for transplanting in April.', 'sow_indoors', 'vegetable', 'medium'),
(2, 'Apply lime to brassica beds if needed', 'Test soil pH. Lime if below 6.5 to prevent clubroot. Apply 4–6 weeks before planting.', 'prepare', 'vegetable', 'medium'),
(2, 'Prune autumn-fruiting raspberries to ground', 'Cut all canes to ground level in late February. New canes will fruit this autumn.', 'prune', 'fruit', 'high'),
(2, 'Prepare beds — add compost or well-rotted manure', 'Dig in or top-dress beds with compost before the growing season begins.', 'prepare', 'general', 'medium'),

-- ── MARCH ────────────────────────────────────────────────────────────────────
(3, 'Direct sow peas outdoors', 'Soil starting to warm (8–10°C). Protect from mice and pigeons with a cloche or wire guard.', 'sow_outdoors', 'vegetable', 'high'),
(3, 'Sow cabbages, kale, and leeks indoors', 'Start in seed trays. Kale and cabbage very easy — good for beginners.', 'sow_indoors', 'vegetable', 'high'),
(3, 'Slug watch begins — high risk month', 'Mild and wet March is peak slug time. Set traps, apply nematodes (Nemaslug) when soil is 5°C+.', 'protect', 'general', 'high'),
(3, 'Sow carrots outdoors (with fleece)', 'Sow thinly under fleece from late March. Fleece warms soil and deters carrot fly.', 'sow_outdoors', 'vegetable', 'medium'),
(3, 'Divide herbaceous perennials', 'Hardy perennials (helenium, echinacea, astrantia) can be divided in March before growth is too advanced.', 'divide', 'perennial', 'medium'),
(3, 'Harden off seedlings started in January', 'Move onion and leek seedlings to a cold frame or sheltered spot during the day.', 'prepare', 'vegetable', 'medium'),
(3, 'Sow snapdragons, cosmos, and stocks indoors', 'Many half-hardy annuals should be sown in March for summer colour.', 'sow_indoors', 'flower', 'medium'),
(3, 'Feed fruit trees and bushes with general fertiliser', 'Sprinkle blood, fish and bone or general fertiliser around the drip line.', 'feed', 'fruit', 'medium'),

-- ── APRIL ────────────────────────────────────────────────────────────────────
(4, 'Plant first early potatoes outdoors', 'Plant from early April when risk of hard frost is reduced. Earth up regularly.', 'plant_out', 'vegetable', 'high'),
(4, 'Harden off February/March seedlings', 'Tomatoes, peppers, brassicas started indoors need 10–14 days hardening off in a cold frame.', 'prepare', 'vegetable', 'high'),
(4, 'Sow French and runner beans indoors', 'Start in pots indoors for planting out after last frost (mid-May in Kildare).', 'sow_indoors', 'vegetable', 'high'),
(4, 'Transplant leeks and cabbages to final positions', 'Leeks to outside once 20cm tall. Cabbages after hardening off.', 'plant_out', 'vegetable', 'medium'),
(4, 'Slug watch — peak risk for new transplants', 'Fresh transplants most vulnerable. Apply copper tape, wool pellets, or nematodes.', 'protect', 'general', 'high'),
(4, 'Direct sow beetroot, chard, and spinach', 'Good month for direct sowing root veg and salads.', 'sow_outdoors', 'vegetable', 'medium'),
(4, 'Plant dahlias in pots under cover', 'Start dahlia tubers in large pots undercover to get a head start before planting out after frost.', 'plant_out', 'flower', 'medium'),
(4, 'Sow zinnias, sunflowers, and dahlias indoors', 'Tender annuals and dahlias from seed need warmth to get started.', 'sow_indoors', 'flower', 'medium'),

-- ── MAY ──────────────────────────────────────────────────────────────────────
(5, 'Plant out tomatoes after last frost (mid-May)', 'Kildare last frost ~April 20. Allow until mid-May to be safe before planting into polytunnel or sheltered bed.', 'plant_out', 'vegetable', 'high'),
(5, 'Plant out French beans and runner beans', 'Only after last frost risk is completely gone. Use fleece if unexpected cold snap.', 'plant_out', 'vegetable', 'high'),
(5, 'Plant out dahlias and tender annuals', 'Once all frost risk has passed. Harden off thoroughly first.', 'plant_out', 'flower', 'high'),
(5, 'Sow courgettes, pumpkins, and cucumbers indoors', 'Start in pots for transplanting in June. Direct sow outdoors from late May.', 'sow_indoors', 'vegetable', 'high'),
(5, 'Slug watch — high risk after warm rain', 'May and June can have severe slug pressure. Monitor daily around newly planted crops.', 'protect', 'general', 'high'),
(5, 'Succession sow lettuce and salads outdoors', 'Sow every 3 weeks for continuous supply through summer.', 'sow_outdoors', 'vegetable', 'medium'),
(5, 'Earth up potatoes regularly', 'Keep earthing up as haulm grows to prevent greening and maximise yield.', 'maintenance', 'vegetable', 'high'),
(5, 'Feed tomatoes once flowers form', 'Weekly high-potash tomato feed throughout summer once flowers appear.', 'feed', 'vegetable', 'medium'),

-- ── JUNE ─────────────────────────────────────────────────────────────────────
(6, 'Succession sow lettuce, salads, and radish', 'Every 3 weeks to avoid glut and ensure continuous supply.', 'sow_outdoors', 'vegetable', 'high'),
(6, 'Plant out courgettes and pumpkins', 'June is safe for planting out frost-tender crops that were started indoors.', 'plant_out', 'vegetable', 'high'),
(6, 'Watch for blight on potatoes', 'First blight alerts usually come in June in warm wet weather. Remove affected foliage immediately.', 'protect', 'vegetable', 'high'),
(6, 'Water regularly in dry spells', 'Irish summers can have dry periods. Especially important for tomatoes, courgettes, and salads.', 'water', 'general', 'medium'),
(6, 'Deadhead roses and repeat-flowering perennials', 'Encourages further flowering throughout the summer.', 'deadhead', 'flower', 'medium'),
(6, 'Harvest garlic when lower leaves start yellowing', 'Garlic harvested when 2–3 lower leaves have yellowed. Do not wait too long.', 'harvest', 'vegetable', 'medium'),
(6, 'Plant out celery and celeriac', 'June is the right time — they need a long season but frost-free conditions.', 'plant_out', 'vegetable', 'low'),

-- ── JULY ─────────────────────────────────────────────────────────────────────
(7, 'Harvest garlic and onions when leaves yellow and fall', 'Lift carefully, dry in sun (or shed in Irish weather!) for 2–3 weeks before storing.', 'harvest', 'vegetable', 'high'),
(7, 'Harvest peas and beans regularly', 'Pick every 2–3 days to prevent pods maturing and stopping production.', 'harvest', 'vegetable', 'high'),
(7, 'Watch for blight on tomatoes and potatoes', 'July–August is peak blight season in Ireland. Ventilate polytunnel well.', 'protect', 'vegetable', 'high'),
(7, 'Summer prune trained fruit trees', 'Summer prune in late July — cut side shoots to 3 leaves from the basal cluster.', 'prune', 'fruit', 'medium'),
(7, 'Feed hungry crops with balanced liquid feed', 'Tomatoes, courgettes, leeks all appreciate a weekly feed in peak growing season.', 'feed', 'vegetable', 'medium'),
(7, 'Harvest and preserve soft fruit', 'Strawberries, raspberries, blackcurrants — pick regularly and freeze or jam surplus.', 'harvest', 'fruit', 'high'),
(7, 'Sow winter cabbages and kale', 'Sow in July for autumn/winter harvest. These need the full season.', 'sow_indoors', 'vegetable', 'medium'),

-- ── AUGUST ───────────────────────────────────────────────────────────────────
(8, 'Sow spring onions and spinach for autumn harvest', 'Good conditions for fast-growing salads that will mature before first frost.', 'sow_outdoors', 'vegetable', 'high'),
(8, 'Sow oriental salads and pak choi', 'August sowing gives autumn harvests before first frost.', 'sow_outdoors', 'vegetable', 'medium'),
(8, 'Harvest maincrop potatoes', 'Maincrop varieties ready from August. Leave in ground until tops die back.', 'harvest', 'vegetable', 'high'),
(8, 'Collect seeds from plants you want to save', 'Let some parsley, dill, coriander go to seed and collect in paper envelopes.', 'maintenance', 'general', 'low'),
(8, 'Continue succession sowing lettuce', 'Last succession sowing of the season — will provide autumn salads.', 'sow_outdoors', 'vegetable', 'medium'),
(8, 'Order spring bulbs for autumn planting', 'Tulips, alliums, narcissus — order now for best choice before autumn planting.', 'order', 'bulb', 'medium'),
(8, 'Take hardwood cuttings of shrubs', 'Take cuttings of roses, currants, and other shrubs for next year''s plants.', 'maintenance', 'general', 'low'),

-- ── SEPTEMBER ────────────────────────────────────────────────────────────────
(9, 'Plant garlic for next year', 'September or October planting gives overwintered garlic with the best yields.', 'plant_out', 'vegetable', 'high'),
(9, 'Plant spring bulbs — daffodils and alliums first', 'Start with daffodils and alliums in September. Tulips can wait until October–November.', 'plant_out', 'bulb', 'high'),
(9, 'Slug watch — second peak season after rain', 'Autumn slugs can devastate winter crops and newly planted bulbs. Monitor carefully.', 'protect', 'general', 'high'),
(9, 'Harvest maincrop potatoes and store', 'Dig up remaining maincrops, leave to dry briefly, store in paper sacks in frost-free shed.', 'harvest', 'vegetable', 'high'),
(9, 'Harvest and store squash and pumpkin', 'Leave on vine as long as possible but harvest before first frost. Cure in sun to harden skin.', 'harvest', 'vegetable', 'medium'),
(9, 'Divide perennials — helenium, achillea, astrantia', 'Early autumn is an excellent time to divide established perennials.', 'divide', 'perennial', 'medium'),
(9, 'Sow green manure on empty beds', 'Phacelia, mustard, or winter rye to protect and improve soil over winter.', 'sow_outdoors', 'general', 'medium'),
(9, 'Clear summer crops and compost debris', 'Remove tomato, courgette, and bean plants after frost. Compost healthy material.', 'compost', 'general', 'medium'),

-- ── OCTOBER ──────────────────────────────────────────────────────────────────
(10, 'Lift and store dahlias before first frost', 'First Kildare frost typically late October. Lift tubers after blackening foliage. Store in dry compost.', 'protect', 'flower', 'high'),
(10, 'Plant tulip bulbs now through November', 'Tulips planted late (October–November) have lower risk of tulip fire disease.', 'plant_out', 'bulb', 'high'),
(10, 'Harvest remaining root veg and store', 'Carrots, parsnips, beetroot. Parsnips can stay in ground — improved by frost.', 'harvest', 'vegetable', 'high'),
(10, 'Protect tender perennials with mulch', 'Apply thick mulch of bark or straw around marginally hardy perennials before hard frost arrives.', 'protect', 'perennial', 'medium'),
(10, 'Clean out polytunnel or greenhouse', 'Remove summer crops, wash glass/polythene with dilute Jeyes Fluid. Reduces disease overwintering.', 'maintenance', 'general', 'medium'),
(10, 'Plant bare root hedging and trees', 'Bare root season begins October–November. Excellent time for planting when dormant.', 'plant_out', 'general', 'medium'),
(10, 'Collect and compost fallen leaves', 'Leaf mould is excellent soil conditioner. Collect, bag in holed bin bags, let rot for 1–2 years.', 'compost', 'general', 'low'),

-- ── NOVEMBER ─────────────────────────────────────────────────────────────────
(11, 'Plant bare root roses, hedging, and fruit trees', 'Peak bare root season. Plants establish well over winter — much cheaper than container plants.', 'plant_out', 'general', 'high'),
(11, 'Harvest kale and winter brassicas — improved by frost', 'Kale, Brussels sprouts, and winter cabbage are sweetened by frost. Pick outer leaves.', 'harvest', 'vegetable', 'high'),
(11, 'Check stored dahlias and tubers for rot', 'Inspect stored tubers monthly. Remove any soft or rotten sections immediately.', 'maintenance', 'flower', 'medium'),
(11, 'Last tulip planting of the season', 'Tulips can be planted until the ground freezes — typically safe until late November in Kildare.', 'plant_out', 'bulb', 'medium'),
(11, 'Protect outdoor taps from frost', 'Lag outdoor taps and exposed pipes before hard frost arrives.', 'protect', 'general', 'low'),
(11, 'Order seed catalogues and plan next season', 'November is ideal for planning next year''s crop rotation and ordering from specialist suppliers.', 'order', 'general', 'low'),

-- ── DECEMBER ─────────────────────────────────────────────────────────────────
(12, 'Clean, oil, and store tools for winter', 'Remove soil, oil metal parts with linseed oil or WD-40. Sharpen if not done already.', 'maintenance', 'general', 'medium'),
(12, 'Order seed catalogues and plan rotation', 'Ideal planning time. Review what worked, plan next year''s crop rotation across beds.', 'order', 'general', 'high'),
(12, 'Check stored bulbs, tubers, and root veg', 'Monthly check on all stored crops. Remove any showing rot before it spreads.', 'maintenance', 'general', 'medium'),
(12, 'Harvest parsnips, leeks, and winter kale', 'These hardy crops continue providing through December and beyond.', 'harvest', 'vegetable', 'high'),
(12, 'Service the lawnmower and garden machinery', 'Sharpen blades, change oil, replace spark plugs if needed. Ready for spring.', 'maintenance', 'general', 'low'),
(12, 'Protect brassicas from pigeons and harsh frost', 'Heavy snow or hard frost can damage winter brassicas. Fleece if forecast below -5°C.', 'protect', 'vegetable', 'medium');
