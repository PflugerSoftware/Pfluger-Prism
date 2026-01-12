-- Refresh Project Elemental Costs
-- This script clears all existing elemental costs and adds all 28 codes to every project

-- Step 1: Clear all existing project elemental costs
DELETE FROM project_elemental_costs;

-- Step 2: Reset auto-increment
ALTER TABLE project_elemental_costs AUTO_INCREMENT = 1;

-- Step 3: Insert all elemental codes for every project
-- This creates a row for each project + elemental code combination with default values
INSERT INTO project_elemental_costs (project_id, code, name, cost_per_sf, cost)
SELECT
    p.id as project_id,
    ec.code,
    ec.name,
    0 as cost_per_sf,
    0 as cost
FROM projects p
CROSS JOIN elemental_codes ec
WHERE ec.is_active = 1
ORDER BY p.id, ec.sort_order;

-- Verify the results
SELECT
    p.id as project_id,
    p.name as project_name,
    COUNT(pec.id) as elemental_cost_count
FROM projects p
LEFT JOIN project_elemental_costs pec ON p.id = pec.project_id
GROUP BY p.id, p.name
ORDER BY p.id;
