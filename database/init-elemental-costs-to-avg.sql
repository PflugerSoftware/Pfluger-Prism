-- Initialize project elemental costs to average values from cost_rates
-- This uses each project's building_type to get the correct rates
-- Only updates rows where cost_per_sf is currently 0

-- Update each project's elemental costs with the average cost_per_sf from cost_rates
-- and calculate the cost based on project square footage

UPDATE project_elemental_costs pec
JOIN projects p ON pec.project_id = p.id
JOIN cost_rates cr ON pec.code = cr.elemental_code AND p.building_type = cr.building_type
SET
    pec.cost_per_sf = cr.cost_per_sf_avg,
    pec.cost = cr.cost_per_sf_avg * p.square_footage,
    pec.updated_at = NOW()
WHERE pec.cost_per_sf = 0 OR pec.cost_per_sf IS NULL;

-- Verify the results - show sample of updated values
SELECT
    p.id as project_id,
    p.name as project_name,
    p.building_type,
    p.square_footage,
    pec.code,
    pec.name as element_name,
    pec.cost_per_sf,
    pec.cost
FROM project_elemental_costs pec
JOIN projects p ON pec.project_id = p.id
WHERE pec.cost_per_sf > 0
ORDER BY p.id, pec.code
LIMIT 50;

-- Show totals per project
SELECT
    p.id as project_id,
    p.name as project_name,
    p.building_type,
    p.square_footage,
    SUM(pec.cost_per_sf) as total_cost_per_sf,
    SUM(pec.cost) as total_base_cost
FROM project_elemental_costs pec
JOIN projects p ON pec.project_id = p.id
GROUP BY p.id, p.name, p.building_type, p.square_footage
ORDER BY p.id;
