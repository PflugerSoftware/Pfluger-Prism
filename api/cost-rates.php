<?php
/**
 * Cost Rates API Endpoint
 * Handles CRUD operations for Vermulens cost entry system
 *
 * Endpoints:
 *   GET  /cost-rates.php - Get all cost rates (optionally filter by building_type)
 *   GET  /cost-rates.php?resource=codes - Get all elemental codes
 *   GET  /cost-rates.php?resource=export - Export all cost rates as CSV
 *   POST /cost-rates.php - Update cost rates (batch update)
 *   POST /cost-rates.php?action=import - Import cost rates from CSV
 */

require_once 'config.php';

// Require authentication
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

/**
 * GET - Retrieve cost rates or elemental codes
 */
if ($method === 'GET') {
    $resource = isset($_GET['resource']) ? $_GET['resource'] : 'rates';

    // Export all cost rates as CSV
    if ($resource === 'export') {
        try {
            $stmt = $pdo->query("
                SELECT cr.building_type, cr.elemental_code, ec.name as code_name, ec.category,
                       cr.cost_per_sf_low, cr.cost_per_sf_avg, cr.cost_per_sf_high,
                       cr.mult_procurement_cmar, cr.mult_procurement_hard_bid,
                       cr.mult_procurement_design_build, cr.mult_procurement_csp,
                       cr.mult_construction_concrete, cr.mult_construction_steel,
                       cr.mult_construction_mass_timber, cr.mult_construction_wood_frame,
                       cr.mult_stories_1, cr.mult_stories_2, cr.mult_stories_3, cr.mult_stories_4
                FROM cost_rates cr
                JOIN elemental_codes ec ON cr.elemental_code = ec.code
                ORDER BY cr.building_type, ec.sort_order
            ");
            $rates = $stmt->fetchAll();

            // Set headers for CSV download
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="cost_rates_export_' . date('Y-m-d') . '.csv"');
            header('Pragma: no-cache');
            header('Expires: 0');

            $output = fopen('php://output', 'w');

            // Write header row
            fputcsv($output, [
                'building_type', 'elemental_code', 'code_name', 'category',
                'cost_per_sf_low', 'cost_per_sf_avg', 'cost_per_sf_high',
                'mult_procurement_cmar', 'mult_procurement_hard_bid',
                'mult_procurement_design_build', 'mult_procurement_csp',
                'mult_construction_concrete', 'mult_construction_steel',
                'mult_construction_mass_timber', 'mult_construction_wood_frame',
                'mult_stories_1', 'mult_stories_2', 'mult_stories_3', 'mult_stories_4'
            ]);

            // Write data rows
            foreach ($rates as $rate) {
                fputcsv($output, [
                    $rate['building_type'],
                    $rate['elemental_code'],
                    $rate['code_name'],
                    $rate['category'],
                    $rate['cost_per_sf_low'],
                    $rate['cost_per_sf_avg'],
                    $rate['cost_per_sf_high'],
                    $rate['mult_procurement_cmar'],
                    $rate['mult_procurement_hard_bid'],
                    $rate['mult_procurement_design_build'],
                    $rate['mult_procurement_csp'],
                    $rate['mult_construction_concrete'],
                    $rate['mult_construction_steel'],
                    $rate['mult_construction_mass_timber'],
                    $rate['mult_construction_wood_frame'],
                    $rate['mult_stories_1'],
                    $rate['mult_stories_2'],
                    $rate['mult_stories_3'],
                    $rate['mult_stories_4']
                ]);
            }

            fclose($output);
            exit;

        } catch (Exception $e) {
            sendError('Failed to export cost data: ' . $e->getMessage(), 500);
        }
    }

    try {
        if ($resource === 'codes') {
            // Get all elemental codes
            $stmt = $pdo->query("
                SELECT code, name, category, sort_order
                FROM elemental_codes
                WHERE is_active = 1
                ORDER BY sort_order
            ");
            $codes = $stmt->fetchAll();
            sendResponse($codes);
        }

        // Default: get cost rates with multipliers
        $buildingType = isset($_GET['building_type']) ? $_GET['building_type'] : null;

        if ($buildingType) {
            $stmt = $pdo->prepare("
                SELECT cr.id, cr.building_type, cr.elemental_code,
                       cr.cost_per_sf_low, cr.cost_per_sf_avg, cr.cost_per_sf_high,
                       cr.mult_procurement_cmar, cr.mult_procurement_hard_bid,
                       cr.mult_procurement_design_build, cr.mult_procurement_csp,
                       cr.mult_construction_concrete, cr.mult_construction_steel,
                       cr.mult_construction_mass_timber, cr.mult_construction_wood_frame,
                       cr.mult_stories_1, cr.mult_stories_2, cr.mult_stories_3, cr.mult_stories_4,
                       cr.updated_at, ec.name as code_name, ec.category
                FROM cost_rates cr
                JOIN elemental_codes ec ON cr.elemental_code = ec.code
                WHERE cr.building_type = ?
                ORDER BY ec.sort_order
            ");
            $stmt->execute([$buildingType]);
        } else {
            $stmt = $pdo->query("
                SELECT cr.id, cr.building_type, cr.elemental_code,
                       cr.cost_per_sf_low, cr.cost_per_sf_avg, cr.cost_per_sf_high,
                       cr.mult_procurement_cmar, cr.mult_procurement_hard_bid,
                       cr.mult_procurement_design_build, cr.mult_procurement_csp,
                       cr.mult_construction_concrete, cr.mult_construction_steel,
                       cr.mult_construction_mass_timber, cr.mult_construction_wood_frame,
                       cr.mult_stories_1, cr.mult_stories_2, cr.mult_stories_3, cr.mult_stories_4,
                       cr.updated_at, ec.name as code_name, ec.category
                FROM cost_rates cr
                JOIN elemental_codes ec ON cr.elemental_code = ec.code
                ORDER BY cr.building_type, ec.sort_order
            ");
        }

        $rates = $stmt->fetchAll();

        // Convert numeric strings to floats
        foreach ($rates as &$rate) {
            $rate['cost_per_sf_low'] = floatval($rate['cost_per_sf_low']);
            $rate['cost_per_sf_avg'] = floatval($rate['cost_per_sf_avg']);
            $rate['cost_per_sf_high'] = floatval($rate['cost_per_sf_high']);
            // Multipliers
            $rate['mult_procurement_cmar'] = floatval($rate['mult_procurement_cmar']);
            $rate['mult_procurement_hard_bid'] = floatval($rate['mult_procurement_hard_bid']);
            $rate['mult_procurement_design_build'] = floatval($rate['mult_procurement_design_build']);
            $rate['mult_procurement_csp'] = floatval($rate['mult_procurement_csp']);
            $rate['mult_construction_concrete'] = floatval($rate['mult_construction_concrete']);
            $rate['mult_construction_steel'] = floatval($rate['mult_construction_steel']);
            $rate['mult_construction_mass_timber'] = floatval($rate['mult_construction_mass_timber']);
            $rate['mult_construction_wood_frame'] = floatval($rate['mult_construction_wood_frame']);
            $rate['mult_stories_1'] = floatval($rate['mult_stories_1']);
            $rate['mult_stories_2'] = floatval($rate['mult_stories_2']);
            $rate['mult_stories_3'] = floatval($rate['mult_stories_3']);
            $rate['mult_stories_4'] = floatval($rate['mult_stories_4']);
        }

        sendResponse($rates);

    } catch (Exception $e) {
        sendError('Failed to fetch cost data: ' . $e->getMessage(), 500);
    }
}

/**
 * POST - Update cost rates (batch update)
 */
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['rates']) || !is_array($data['rates'])) {
        sendError('Invalid request: rates array required', 400);
    }

    $userId = $_SESSION['user_id'];

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            UPDATE cost_rates
            SET cost_per_sf_low = ?,
                cost_per_sf_avg = ?,
                cost_per_sf_high = ?,
                mult_procurement_cmar = ?,
                mult_procurement_hard_bid = ?,
                mult_procurement_design_build = ?,
                mult_procurement_csp = ?,
                mult_construction_concrete = ?,
                mult_construction_steel = ?,
                mult_construction_mass_timber = ?,
                mult_construction_wood_frame = ?,
                mult_stories_1 = ?,
                mult_stories_2 = ?,
                mult_stories_3 = ?,
                mult_stories_4 = ?,
                updated_by = ?
            WHERE building_type = ? AND elemental_code = ?
        ");

        $updated = 0;
        foreach ($data['rates'] as $rate) {
            if (!isset($rate['building_type']) || !isset($rate['elemental_code'])) {
                continue;
            }

            $stmt->execute([
                floatval($rate['cost_per_sf_low'] ?? 0),
                floatval($rate['cost_per_sf_avg'] ?? 0),
                floatval($rate['cost_per_sf_high'] ?? 0),
                floatval($rate['mult_procurement_cmar'] ?? 1),
                floatval($rate['mult_procurement_hard_bid'] ?? 1),
                floatval($rate['mult_procurement_design_build'] ?? 1),
                floatval($rate['mult_procurement_csp'] ?? 1),
                floatval($rate['mult_construction_concrete'] ?? 1),
                floatval($rate['mult_construction_steel'] ?? 1),
                floatval($rate['mult_construction_mass_timber'] ?? 1),
                floatval($rate['mult_construction_wood_frame'] ?? 1),
                floatval($rate['mult_stories_1'] ?? 1),
                floatval($rate['mult_stories_2'] ?? 1),
                floatval($rate['mult_stories_3'] ?? 1),
                floatval($rate['mult_stories_4'] ?? 1),
                $userId,
                $rate['building_type'],
                $rate['elemental_code']
            ]);

            if ($stmt->rowCount() > 0) {
                $updated++;
            }
        }

        $pdo->commit();

        sendResponse([
            'success' => true,
            'message' => "Updated $updated cost rates",
            'updated_count' => $updated
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError('Failed to update cost rates: ' . $e->getMessage(), 500);
    }
}

sendError('Invalid request method', 405);
?>
