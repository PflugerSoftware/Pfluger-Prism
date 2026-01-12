-- Seed cost_rates with realistic sample data for Elementary building type
-- These are example values - Vermulens will update with real data

UPDATE cost_rates SET
  cost_per_sf_low = 12.00, cost_per_sf_avg = 15.00, cost_per_sf_high = 18.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 0.95, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.25, mult_construction_wood_frame = 0.85,
  mult_stories_1 = 1.00, mult_stories_2 = 1.05, mult_stories_3 = 1.10, mult_stories_4 = 1.15
WHERE building_type = 'Elementary' AND elemental_code = 'A10';

UPDATE cost_rates SET
  cost_per_sf_low = 8.00, cost_per_sf_avg = 10.00, cost_per_sf_high = 12.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 0.90, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.20, mult_construction_wood_frame = 0.80,
  mult_stories_1 = 1.00, mult_stories_2 = 1.03, mult_stories_3 = 1.06, mult_stories_4 = 1.09
WHERE building_type = 'Elementary' AND elemental_code = 'A20';

UPDATE cost_rates SET
  cost_per_sf_low = 2.00, cost_per_sf_avg = 3.00, cost_per_sf_high = 4.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'A30';

UPDATE cost_rates SET
  cost_per_sf_low = 18.00, cost_per_sf_avg = 22.00, cost_per_sf_high = 28.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 0.85, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.35, mult_construction_wood_frame = 0.75,
  mult_stories_1 = 1.00, mult_stories_2 = 1.08, mult_stories_3 = 1.16, mult_stories_4 = 1.24
WHERE building_type = 'Elementary' AND elemental_code = 'B10';

UPDATE cost_rates SET
  cost_per_sf_low = 14.00, cost_per_sf_avg = 18.00, cost_per_sf_high = 22.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 0.90, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.30, mult_construction_wood_frame = 0.80,
  mult_stories_1 = 1.00, mult_stories_2 = 1.05, mult_stories_3 = 1.10, mult_stories_4 = 1.15
WHERE building_type = 'Elementary' AND elemental_code = 'B20';

UPDATE cost_rates SET
  cost_per_sf_low = 22.00, cost_per_sf_avg = 28.00, cost_per_sf_high = 35.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 0.80, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.40, mult_construction_wood_frame = 0.70,
  mult_stories_1 = 1.00, mult_stories_2 = 1.10, mult_stories_3 = 1.20, mult_stories_4 = 1.30
WHERE building_type = 'Elementary' AND elemental_code = 'B30';

UPDATE cost_rates SET
  cost_per_sf_low = 3.00, cost_per_sf_avg = 4.00, cost_per_sf_high = 5.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.10, mult_construction_wood_frame = 0.95,
  mult_stories_1 = 1.00, mult_stories_2 = 1.02, mult_stories_3 = 1.04, mult_stories_4 = 1.06
WHERE building_type = 'Elementary' AND elemental_code = 'B40';

UPDATE cost_rates SET
  cost_per_sf_low = 25.00, cost_per_sf_avg = 32.00, cost_per_sf_high = 40.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 0.95, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.15, mult_construction_wood_frame = 0.90,
  mult_stories_1 = 1.00, mult_stories_2 = 1.03, mult_stories_3 = 1.06, mult_stories_4 = 1.09
WHERE building_type = 'Elementary' AND elemental_code = 'C10';

UPDATE cost_rates SET
  cost_per_sf_low = 12.00, cost_per_sf_avg = 16.00, cost_per_sf_high = 20.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.02, mult_stories_3 = 1.04, mult_stories_4 = 1.06
WHERE building_type = 'Elementary' AND elemental_code = 'C20';

UPDATE cost_rates SET
  cost_per_sf_low = 4.00, cost_per_sf_avg = 6.00, cost_per_sf_high = 8.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'C30';

UPDATE cost_rates SET
  cost_per_sf_low = 10.00, cost_per_sf_avg = 14.00, cost_per_sf_high = 18.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.05, mult_construction_wood_frame = 0.95,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'C40';

UPDATE cost_rates SET
  cost_per_sf_low = 2.00, cost_per_sf_avg = 3.00, cost_per_sf_high = 4.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'C50';

UPDATE cost_rates SET
  cost_per_sf_low = 8.00, cost_per_sf_avg = 12.00, cost_per_sf_high = 16.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.02, mult_stories_3 = 1.04, mult_stories_4 = 1.06
WHERE building_type = 'Elementary' AND elemental_code = 'D10';

UPDATE cost_rates SET
  cost_per_sf_low = 5.00, cost_per_sf_avg = 7.00, cost_per_sf_high = 9.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.02, mult_stories_3 = 1.04, mult_stories_4 = 1.06
WHERE building_type = 'Elementary' AND elemental_code = 'D20';

UPDATE cost_rates SET
  cost_per_sf_low = 6.00, cost_per_sf_avg = 8.00, cost_per_sf_high = 10.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'D30';

UPDATE cost_rates SET
  cost_per_sf_low = 4.00, cost_per_sf_avg = 6.00, cost_per_sf_high = 8.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 0.95, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.10, mult_construction_wood_frame = 0.90,
  mult_stories_1 = 1.00, mult_stories_2 = 1.15, mult_stories_3 = 1.30, mult_stories_4 = 1.45
WHERE building_type = 'Elementary' AND elemental_code = 'D40';

UPDATE cost_rates SET
  cost_per_sf_low = 15.00, cost_per_sf_avg = 20.00, cost_per_sf_high = 25.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'D50';

UPDATE cost_rates SET
  cost_per_sf_low = 12.00, cost_per_sf_avg = 16.00, cost_per_sf_high = 20.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.05, mult_stories_3 = 1.10, mult_stories_4 = 1.15
WHERE building_type = 'Elementary' AND elemental_code = 'E10';

UPDATE cost_rates SET
  cost_per_sf_low = 22.00, cost_per_sf_avg = 28.00, cost_per_sf_high = 35.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.03, mult_stories_3 = 1.06, mult_stories_4 = 1.09
WHERE building_type = 'Elementary' AND elemental_code = 'E20';

UPDATE cost_rates SET
  cost_per_sf_low = 6.00, cost_per_sf_avg = 8.00, cost_per_sf_high = 10.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.02, mult_stories_3 = 1.04, mult_stories_4 = 1.06
WHERE building_type = 'Elementary' AND elemental_code = 'E30';

UPDATE cost_rates SET
  cost_per_sf_low = 18.00, cost_per_sf_avg = 24.00, cost_per_sf_high = 30.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.05, mult_stories_3 = 1.10, mult_stories_4 = 1.15
WHERE building_type = 'Elementary' AND elemental_code = 'E40';

UPDATE cost_rates SET
  cost_per_sf_low = 0.00, cost_per_sf_avg = 2.00, cost_per_sf_high = 8.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.50, mult_stories_3 = 1.80, mult_stories_4 = 2.00
WHERE building_type = 'Elementary' AND elemental_code = 'E50';

UPDATE cost_rates SET
  cost_per_sf_low = 4.00, cost_per_sf_avg = 6.00, cost_per_sf_high = 10.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'F10';

UPDATE cost_rates SET
  cost_per_sf_low = 3.00, cost_per_sf_avg = 5.00, cost_per_sf_high = 8.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'F20';

UPDATE cost_rates SET
  cost_per_sf_low = 2.00, cost_per_sf_avg = 4.00, cost_per_sf_high = 6.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'G10';

UPDATE cost_rates SET
  cost_per_sf_low = 0.00, cost_per_sf_avg = 2.00, cost_per_sf_high = 5.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'G20';

UPDATE cost_rates SET
  cost_per_sf_low = 8.00, cost_per_sf_avg = 12.00, cost_per_sf_high = 16.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'Z10';

UPDATE cost_rates SET
  cost_per_sf_low = 10.00, cost_per_sf_avg = 15.00, cost_per_sf_high = 20.00,
  mult_procurement_cmar = 0.90, mult_procurement_hard_bid = 1.10, mult_procurement_design_build = 1.00, mult_procurement_csp = 1.05,
  mult_construction_concrete = 1.00, mult_construction_steel = 1.00, mult_construction_mass_timber = 1.00, mult_construction_wood_frame = 1.00,
  mult_stories_1 = 1.00, mult_stories_2 = 1.00, mult_stories_3 = 1.00, mult_stories_4 = 1.00
WHERE building_type = 'Elementary' AND elemental_code = 'Z20';
