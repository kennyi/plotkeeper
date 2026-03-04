-- Migration 008: Seed garden settings with Kildare, Ireland defaults

INSERT INTO garden_settings (setting_key, setting_value) VALUES
  ('garden_name',           'My Garden'),
  ('location_name',         'Kildare, Ireland'),
  ('latitude',              '53.1581'),
  ('longitude',             '-6.9108'),
  ('hardiness_zone',        'H4-H5'),
  ('last_frost_approx',     'April 20'),
  ('first_frost_approx',    'October 30'),
  ('soil_type',             'variable'),
  ('total_garden_area_m2',  NULL)
ON CONFLICT (setting_key) DO NOTHING;
