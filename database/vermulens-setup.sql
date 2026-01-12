-- Vermulens Cost Entry System Setup
-- Run this SQL on the pflugera_projectprism_db database

-- 1. Update users role enum to include 'vermulens'
ALTER TABLE `users`
MODIFY COLUMN `role` enum('admin','editor','viewer','vermulens')
COLLATE utf8mb4_unicode_ci DEFAULT 'viewer';

-- 2. Create Vermulens user account
-- Password: eomyF9L7tOJ6
INSERT INTO `users` (`email`, `password_hash`, `first_name`, `last_name`, `role`, `is_active`)
VALUES ('vermulens@pflugerarchitects.com', '$2b$10$vx1QY5Usj0tE.5rnP1zY6uxTXlIuNNUbiekS.TDLiLzbo3k9p5Qfi', 'Vermulens', 'Cost Estimator', 'vermulens', 1);

-- 3. Create elemental_codes reference table (full Uniformat breakdown)
CREATE TABLE IF NOT EXISTS `elemental_codes` (
  `code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert full Uniformat elemental codes
INSERT INTO `elemental_codes` (`code`, `name`, `category`, `sort_order`) VALUES
('A10', 'Foundations', 'Substructure', 1),
('A20', 'Basement Construction', 'Substructure', 2),
('A30', 'Substructure Specialties', 'Substructure', 3),
('B10', 'Floor Construction', 'Shell', 4),
('B20', 'Roof Construction', 'Shell', 5),
('B30', 'Structural Frame', 'Shell', 6),
('B40', 'Structural Specialties', 'Shell', 7),
('C10', 'Exterior Walls', 'Enclosure', 8),
('C20', 'Exterior Windows', 'Enclosure', 9),
('C30', 'Exterior Doors', 'Enclosure', 10),
('C40', 'Roofing', 'Enclosure', 11),
('C50', 'Exterior Specialties', 'Enclosure', 12),
('D10', 'Interior Partitions', 'Interiors', 13),
('D20', 'Interior Doors', 'Interiors', 14),
('D30', 'Fittings & Specialties', 'Interiors', 15),
('D40', 'Stairs', 'Interiors', 16),
('D50', 'Finishes', 'Interiors', 17),
('E10', 'Plumbing', 'Services', 18),
('E20', 'HVAC', 'Services', 19),
('E30', 'Fire Protection', 'Services', 20),
('E40', 'Electrical', 'Services', 21),
('E50', 'Conveying Systems', 'Services', 22),
('F10', 'Fixed Equipment', 'Equipment', 23),
('F20', 'Furnishings', 'Equipment', 24),
('G10', 'Special Construction', 'Site', 25),
('G20', 'Building Demolition', 'Site', 26),
('Z10', 'General Requirements', 'General', 27),
('Z20', 'Contingency / Escalation', 'General', 28);

-- 4. Create cost_rates table - base $/SF rates by building type
-- This is what Vermulens will edit
CREATE TABLE IF NOT EXISTS `cost_rates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `building_type` enum('Elementary','Middle','High School','Specialty','Administration Building','District') COLLATE utf8mb4_unicode_ci NOT NULL,
  `elemental_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost_per_sf_low` decimal(10,2) DEFAULT 0.00,
  `cost_per_sf_avg` decimal(10,2) DEFAULT 0.00,
  `cost_per_sf_high` decimal(10,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_building_code` (`building_type`, `elemental_code`),
  KEY `idx_building_type` (`building_type`),
  KEY `idx_elemental_code` (`elemental_code`),
  CONSTRAINT `cost_rates_ibfk_1` FOREIGN KEY (`elemental_code`) REFERENCES `elemental_codes` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create cost_multipliers table - multipliers for procurement, construction type, stories
CREATE TABLE IF NOT EXISTS `cost_multipliers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` enum('procurement','construction_type','stories') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `multiplier` decimal(5,3) DEFAULT 1.000,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_value` (`category`, `value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default multipliers (from CSV)
INSERT INTO `cost_multipliers` (`category`, `value`, `multiplier`) VALUES
-- Procurement type
('procurement', 'CMAR', 0.900),
('procurement', 'Hard Bid', 1.100),
('procurement', 'Design Build', 1.000),
('procurement', 'Competitive Sealed Proposal', 1.050),
-- Construction type
('construction_type', 'Concrete', 0.700),
('construction_type', 'Steel', 1.000),
('construction_type', 'Mass Timber', 1.300),
('construction_type', 'Wood Frame', 0.850),
-- Number of stories
('stories', '1', 1.000),
('stories', '2', 1.100),
('stories', '3', 1.200),
('stories', '4', 1.300);

-- 6. Seed initial cost_rates with placeholder values for each building type
-- Vermulens will update these with real values
INSERT INTO `cost_rates` (`building_type`, `elemental_code`, `cost_per_sf_low`, `cost_per_sf_avg`, `cost_per_sf_high`)
SELECT bt.building_type, ec.code, 0.00, 0.00, 0.00
FROM (
  SELECT 'Elementary' as building_type UNION ALL
  SELECT 'Middle' UNION ALL
  SELECT 'High School' UNION ALL
  SELECT 'Specialty' UNION ALL
  SELECT 'Administration Building' UNION ALL
  SELECT 'District'
) bt
CROSS JOIN `elemental_codes` ec;
