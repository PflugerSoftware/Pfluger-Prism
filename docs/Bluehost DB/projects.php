<?php
/**
 * Projects API Endpoint
 * Handles CRUD operations for projects
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

// GET - Fetch all projects with elemental costs
if ($method === 'GET') {

    // Check if requesting a single project by ID
    if (isset($_GET['id'])) {
        $projectId = $_GET['id'];

        // Get project
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch();

        if (!$project) {
            sendError('Project not found', 404);
        }

        // Get elemental costs for this project
        $stmt = $pdo->prepare("SELECT * FROM project_elemental_costs WHERE project_id = ?");
        $stmt->execute([$projectId]);
        $elementalCosts = $stmt->fetchAll();

        $project['elementalCosts'] = $elementalCosts;

        sendResponse($project);
    }

    // Get all projects
    $stmt = $pdo->query("SELECT * FROM projects ORDER BY id ASC");
    $projects = $stmt->fetchAll();

    // Get all elemental costs
    $stmt = $pdo->query("SELECT * FROM project_elemental_costs");
    $allCosts = $stmt->fetchAll();

    // Group costs by project_id
    $costsByProject = [];
    foreach ($allCosts as $cost) {
        $costsByProject[$cost['project_id']][] = $cost;
    }

    // Attach elemental costs to each project
    foreach ($projects as &$project) {
        $project['elementalCosts'] = $costsByProject[$project['id']] ?? [];
    }

    sendResponse($projects);
}

// POST - Create new project
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError('Invalid JSON data');
    }

    try {
        $pdo->beginTransaction();

        // Insert project
        $sql = "INSERT INTO projects (
            name, school_name, building_type, project_type, cost_estimate,
            last_modified, status, square_footage, address, site_area, capacity,
            duration, start_date, completion_date, base_cost, site_costs,
            design_costs, contingency, latitude, longitude, construction_type,
            number_of_stories, procurement_method, leed_certification, leed_cost,
            chips_certification, chips_cost, land_acquisition_cost,
            transportation_infrastructure_cost, environmental_studies_cost,
            asbestos_abatement_cost, site_preparation_cost, inflation_rate,
            total_cost_with_inflation, inflation_amount, space_costs,
            number_of_pods, procurement_phase_duration, procurement_phase_cost,
            design_phase_duration, design_phase_cost, construction_phase_duration,
            construction_phase_cost, project_pauses, current_enrollment, facility_id
        ) VALUES (
            :name, :school_name, :building_type, :project_type, :cost_estimate,
            :last_modified, :status, :square_footage, :address, :site_area, :capacity,
            :duration, :start_date, :completion_date, :base_cost, :site_costs,
            :design_costs, :contingency, :latitude, :longitude, :construction_type,
            :number_of_stories, :procurement_method, :leed_certification, :leed_cost,
            :chips_certification, :chips_cost, :land_acquisition_cost,
            :transportation_infrastructure_cost, :environmental_studies_cost,
            :asbestos_abatement_cost, :site_preparation_cost, :inflation_rate,
            :total_cost_with_inflation, :inflation_amount, :space_costs,
            :number_of_pods, :procurement_phase_duration, :procurement_phase_cost,
            :design_phase_duration, :design_phase_cost, :construction_phase_duration,
            :construction_phase_cost, :project_pauses, :current_enrollment, :facility_id
        )";

        $stmt = $pdo->prepare($sql);

        // Bind parameters
        $stmt->execute([
            ':name' => $data['name'],
            ':school_name' => $data['schoolName'] ?? '',
            ':building_type' => $data['buildingType'],
            ':project_type' => $data['projectType'],
            ':cost_estimate' => $data['costEstimate'] ?? 0,
            ':last_modified' => date('Y-m-d H:i:s'),
            ':status' => $data['status'] ?? 'Draft',
            ':square_footage' => $data['squareFootage'] ?? 0,
            ':address' => $data['address'] ?? '',
            ':site_area' => $data['siteArea'] ?? '',
            ':capacity' => $data['capacity'] ?? 0,
            ':duration' => $data['duration'] ?? '',
            ':start_date' => $data['startDate'] ?? '',
            ':completion_date' => $data['completionDate'] ?? '',
            ':base_cost' => $data['baseCost'] ?? 0,
            ':site_costs' => $data['siteCosts'] ?? 0,
            ':design_costs' => $data['designCosts'] ?? 0,
            ':contingency' => $data['contingency'] ?? 0,
            ':latitude' => $data['latitude'] ?? null,
            ':longitude' => $data['longitude'] ?? null,
            ':construction_type' => $data['constructionType'] ?? 'Concrete',
            ':number_of_stories' => $data['numberOfStories'] ?? 1,
            ':procurement_method' => $data['procurementMethod'] ?? 'Hard Bid',
            ':leed_certification' => $data['leedCertification'] ?? 'None',
            ':leed_cost' => $data['leedCost'] ?? 0,
            ':chips_certification' => $data['chipsCertification'] ?? false,
            ':chips_cost' => $data['chipsCost'] ?? 0,
            ':land_acquisition_cost' => $data['landAcquisitionCost'] ?? 0,
            ':transportation_infrastructure_cost' => $data['transportationInfrastructureCost'] ?? 0,
            ':environmental_studies_cost' => $data['environmentalStudiesCost'] ?? 0,
            ':asbestos_abatement_cost' => $data['asbestosAbatementCost'] ?? 0,
            ':site_preparation_cost' => $data['sitePreparationCost'] ?? 0,
            ':inflation_rate' => $data['inflationRate'] ?? 0,
            ':total_cost_with_inflation' => $data['totalCostWithInflation'] ?? 0,
            ':inflation_amount' => $data['inflationAmount'] ?? 0,
            ':space_costs' => $data['spaceCosts'] ?? 0,
            ':number_of_pods' => $data['numberOfPods'] ?? 0,
            ':procurement_phase_duration' => $data['procurementPhaseDuration'] ?? 0,
            ':procurement_phase_cost' => $data['procurementPhaseCost'] ?? 0,
            ':design_phase_duration' => $data['designPhaseDuration'] ?? 0,
            ':design_phase_cost' => $data['designPhaseCost'] ?? 0,
            ':construction_phase_duration' => $data['constructionPhaseDuration'] ?? 0,
            ':construction_phase_cost' => $data['constructionPhaseCost'] ?? 0,
            ':project_pauses' => $data['projectPauses'] ?? null,
            ':current_enrollment' => $data['currentEnrollment'] ?? 0,
            ':facility_id' => $data['facility_id'] ?? null
        ]);

        $projectId = $pdo->lastInsertId();

        // Insert elemental costs if provided
        if (isset($data['elementalCosts']) && is_array($data['elementalCosts'])) {
            $costSql = "INSERT INTO project_elemental_costs (project_id, code, name, cost_per_sf, cost)
                        VALUES (:project_id, :code, :name, :cost_per_sf, :cost)";
            $costStmt = $pdo->prepare($costSql);

            foreach ($data['elementalCosts'] as $cost) {
                $costStmt->execute([
                    ':project_id' => $projectId,
                    ':code' => $cost['code'],
                    ':name' => $cost['name'],
                    ':cost_per_sf' => $cost['costPerSF'] ?? 0,
                    ':cost' => $cost['cost'] ?? 0
                ]);
            }
        }

        $pdo->commit();

        sendResponse([
            'success' => true,
            'id' => $projectId,
            'message' => 'Project created successfully'
        ], 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError('Failed to create project: ' . $e->getMessage(), 500);
    }
}

// PUT - Update existing project
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['id'])) {
        sendError('Invalid data or missing project ID');
    }

    try {
        $pdo->beginTransaction();

        // Update project
        $sql = "UPDATE projects SET
            name = :name,
            school_name = :school_name,
            building_type = :building_type,
            project_type = :project_type,
            cost_estimate = :cost_estimate,
            last_modified = :last_modified,
            status = :status,
            square_footage = :square_footage,
            address = :address,
            site_area = :site_area,
            capacity = :capacity,
            duration = :duration,
            start_date = :start_date,
            completion_date = :completion_date,
            base_cost = :base_cost,
            site_costs = :site_costs,
            design_costs = :design_costs,
            contingency = :contingency,
            latitude = :latitude,
            longitude = :longitude,
            construction_type = :construction_type,
            number_of_stories = :number_of_stories,
            procurement_method = :procurement_method,
            leed_certification = :leed_certification,
            leed_cost = :leed_cost,
            chips_certification = :chips_certification,
            chips_cost = :chips_cost,
            land_acquisition_cost = :land_acquisition_cost,
            transportation_infrastructure_cost = :transportation_infrastructure_cost,
            environmental_studies_cost = :environmental_studies_cost,
            asbestos_abatement_cost = :asbestos_abatement_cost,
            site_preparation_cost = :site_preparation_cost,
            inflation_rate = :inflation_rate,
            total_cost_with_inflation = :total_cost_with_inflation,
            inflation_amount = :inflation_amount,
            space_costs = :space_costs,
            number_of_pods = :number_of_pods,
            procurement_phase_duration = :procurement_phase_duration,
            procurement_phase_cost = :procurement_phase_cost,
            design_phase_duration = :design_phase_duration,
            design_phase_cost = :design_phase_cost,
            construction_phase_duration = :construction_phase_duration,
            construction_phase_cost = :construction_phase_cost,
            project_pauses = :project_pauses,
            current_enrollment = :current_enrollment,
            facility_id = :facility_id
            WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':school_name' => $data['schoolName'] ?? '',
            ':building_type' => $data['buildingType'],
            ':project_type' => $data['projectType'],
            ':cost_estimate' => $data['costEstimate'] ?? 0,
            ':last_modified' => date('Y-m-d H:i:s'),
            ':status' => $data['status'] ?? 'Draft',
            ':square_footage' => $data['squareFootage'] ?? 0,
            ':address' => $data['address'] ?? '',
            ':site_area' => $data['siteArea'] ?? '',
            ':capacity' => $data['capacity'] ?? 0,
            ':duration' => $data['duration'] ?? '',
            ':start_date' => $data['startDate'] ?? '',
            ':completion_date' => $data['completionDate'] ?? '',
            ':base_cost' => $data['baseCost'] ?? 0,
            ':site_costs' => $data['siteCosts'] ?? 0,
            ':design_costs' => $data['designCosts'] ?? 0,
            ':contingency' => $data['contingency'] ?? 0,
            ':latitude' => $data['latitude'] ?? null,
            ':longitude' => $data['longitude'] ?? null,
            ':construction_type' => $data['constructionType'] ?? 'Concrete',
            ':number_of_stories' => $data['numberOfStories'] ?? 1,
            ':procurement_method' => $data['procurementMethod'] ?? 'Hard Bid',
            ':leed_certification' => $data['leedCertification'] ?? 'None',
            ':leed_cost' => $data['leedCost'] ?? 0,
            ':chips_certification' => $data['chipsCertification'] ?? false,
            ':chips_cost' => $data['chipsCost'] ?? 0,
            ':land_acquisition_cost' => $data['landAcquisitionCost'] ?? 0,
            ':transportation_infrastructure_cost' => $data['transportationInfrastructureCost'] ?? 0,
            ':environmental_studies_cost' => $data['environmentalStudiesCost'] ?? 0,
            ':asbestos_abatement_cost' => $data['asbestosAbatementCost'] ?? 0,
            ':site_preparation_cost' => $data['sitePreparationCost'] ?? 0,
            ':inflation_rate' => $data['inflationRate'] ?? 0,
            ':total_cost_with_inflation' => $data['totalCostWithInflation'] ?? 0,
            ':inflation_amount' => $data['inflationAmount'] ?? 0,
            ':space_costs' => $data['spaceCosts'] ?? 0,
            ':number_of_pods' => $data['numberOfPods'] ?? 0,
            ':procurement_phase_duration' => $data['procurementPhaseDuration'] ?? 0,
            ':procurement_phase_cost' => $data['procurementPhaseCost'] ?? 0,
            ':design_phase_duration' => $data['designPhaseDuration'] ?? 0,
            ':design_phase_cost' => $data['designPhaseCost'] ?? 0,
            ':construction_phase_duration' => $data['constructionPhaseDuration'] ?? 0,
            ':construction_phase_cost' => $data['constructionPhaseCost'] ?? 0,
            ':project_pauses' => $data['projectPauses'] ?? null,
            ':current_enrollment' => $data['currentEnrollment'] ?? 0,
            ':facility_id' => $data['facility_id'] ?? null
        ]);

        // Update elemental costs if provided
        if (isset($data['elementalCosts'])) {
            // Delete existing costs
            $deleteStmt = $pdo->prepare("DELETE FROM project_elemental_costs WHERE project_id = ?");
            $deleteStmt->execute([$data['id']]);

            // Insert new costs
            if (is_array($data['elementalCosts'])) {
                $costSql = "INSERT INTO project_elemental_costs (project_id, code, name, cost_per_sf, cost)
                            VALUES (:project_id, :code, :name, :cost_per_sf, :cost)";
                $costStmt = $pdo->prepare($costSql);

                foreach ($data['elementalCosts'] as $cost) {
                    $costStmt->execute([
                        ':project_id' => $data['id'],
                        ':code' => $cost['code'],
                        ':name' => $cost['name'],
                        ':cost_per_sf' => $cost['costPerSF'] ?? 0,
                        ':cost' => $cost['cost'] ?? 0
                    ]);
                }
            }
        }

        $pdo->commit();

        sendResponse([
            'success' => true,
            'message' => 'Project updated successfully'
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError('Failed to update project: ' . $e->getMessage(), 500);
    }
}

// DELETE - Delete project
if ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        sendError('Project ID required');
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$_GET['id']]);

        sendResponse([
            'success' => true,
            'message' => 'Project deleted successfully'
        ]);

    } catch (Exception $e) {
        sendError('Failed to delete project: ' . $e->getMessage(), 500);
    }
}

sendError('Invalid request method', 405);
?>
