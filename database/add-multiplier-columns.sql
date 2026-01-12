-- Add multiplier columns to cost_rates table
-- Each elemental code can have different multipliers per building type

ALTER TABLE `cost_rates`
ADD COLUMN `mult_procurement_cmar` decimal(5,3) DEFAULT 1.000 AFTER `cost_per_sf_high`,
ADD COLUMN `mult_procurement_hard_bid` decimal(5,3) DEFAULT 1.000 AFTER `mult_procurement_cmar`,
ADD COLUMN `mult_procurement_design_build` decimal(5,3) DEFAULT 1.000 AFTER `mult_procurement_hard_bid`,
ADD COLUMN `mult_procurement_csp` decimal(5,3) DEFAULT 1.000 AFTER `mult_procurement_design_build`,
ADD COLUMN `mult_construction_concrete` decimal(5,3) DEFAULT 1.000 AFTER `mult_procurement_csp`,
ADD COLUMN `mult_construction_steel` decimal(5,3) DEFAULT 1.000 AFTER `mult_construction_concrete`,
ADD COLUMN `mult_construction_mass_timber` decimal(5,3) DEFAULT 1.000 AFTER `mult_construction_steel`,
ADD COLUMN `mult_construction_wood_frame` decimal(5,3) DEFAULT 1.000 AFTER `mult_construction_mass_timber`,
ADD COLUMN `mult_stories_1` decimal(5,3) DEFAULT 1.000 AFTER `mult_construction_wood_frame`,
ADD COLUMN `mult_stories_2` decimal(5,3) DEFAULT 1.000 AFTER `mult_stories_1`,
ADD COLUMN `mult_stories_3` decimal(5,3) DEFAULT 1.000 AFTER `mult_stories_2`,
ADD COLUMN `mult_stories_4` decimal(5,3) DEFAULT 1.000 AFTER `mult_stories_3`;

-- Optional: Drop the old cost_multipliers table if no longer needed
-- DROP TABLE IF EXISTS `cost_multipliers`;
