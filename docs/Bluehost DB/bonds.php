<?php
/**
 * Bonds API Endpoint
 * Handles CRUD operations for bonds and bond-project relationships
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

// GET - Fetch all bonds with linked projects
if ($method === 'GET') {

    // Check if requesting a single bond by ID
    if (isset($_GET['id'])) {
        $bondId = $_GET['id'];

        // Get bond
        $stmt = $pdo->prepare("SELECT * FROM bonds WHERE id = ?");
        $stmt->execute([$bondId]);
        $bond = $stmt->fetch();

        if (!$bond) {
            sendError('Bond not found', 404);
        }

        // Get linked projects
        $stmt = $pdo->prepare("
            SELECT p.*, bp.order_number
            FROM projects p
            INNER JOIN bond_projects bp ON p.id = bp.project_id
            WHERE bp.bond_id = ?
            ORDER BY bp.order_number ASC
        ");
        $stmt->execute([$bondId]);
        $projects = $stmt->fetchAll();

        // Get elemental costs for all linked projects
        if (!empty($projects)) {
            $projectIds = array_column($projects, 'id');
            $placeholders = str_repeat('?,', count($projectIds) - 1) . '?';

            $stmt = $pdo->prepare("SELECT * FROM project_elemental_costs WHERE project_id IN ($placeholders)");
            $stmt->execute($projectIds);
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
            unset($project); // Unset reference
        }

        $bond['projects'] = $projects;

        sendResponse($bond);
    }

    // Get all bonds with their projects
    $stmt = $pdo->query("SELECT * FROM bonds ORDER BY id ASC");
    $bonds = $stmt->fetchAll();

    // Get all bond-project relationships
    $stmt = $pdo->query("
        SELECT p.*, bp.bond_id, bp.order_number, bp.id as bp_id
        FROM projects p
        INNER JOIN bond_projects bp ON p.id = bp.project_id
        ORDER BY bp.bond_id, bp.order_number ASC
    ");
    $allBondProjects = $stmt->fetchAll();

    // DEBUG: Log what we got from database
    error_log("===== BOND PROJECTS DEBUG =====");
    error_log("Total rows from JOIN: " . count($allBondProjects));
    error_log("Raw data: " . json_encode($allBondProjects));
    foreach ($allBondProjects as $proj) {
        error_log(sprintf(
            "bp_id=%s, bond_id=%s, project_id=%s, order=%s, name=%s",
            $proj['bp_id'] ?? 'NULL',
            $proj['bond_id'] ?? 'NULL',
            $proj['id'] ?? 'NULL',
            $proj['order_number'] ?? 'NULL',
            $proj['name'] ?? 'NULL'
        ));
    }

    // Get all elemental costs
    $stmt = $pdo->query("SELECT * FROM project_elemental_costs");
    $allCosts = $stmt->fetchAll();

    // Group costs by project_id
    $costsByProject = [];
    foreach ($allCosts as $cost) {
        $costsByProject[$cost['project_id']][] = $cost;
    }

    // Attach elemental costs to projects
    foreach ($allBondProjects as &$project) {
        $project['elementalCosts'] = $costsByProject[$project['id']] ?? [];
    }
    unset($project); // CRITICAL: Unset reference to avoid bugs in subsequent loops

    // Group projects by bond_id (with deduplication)
    $projectsByBond = [];
    $debugDedup = []; // Track what happens during deduplication

    foreach ($allBondProjects as $index => $project) {
        $bondId = $project['bond_id'];
        $projectId = $project['id'];

        error_log(sprintf(
            "Processing row %d: project_id=%s, name=%s, bond_id=%s",
            $index,
            $projectId,
            $project['name'] ?? 'NULL',
            $bondId
        ));

        // Check if this project is already added to this bond
        if (!isset($projectsByBond[$bondId])) {
            $projectsByBond[$bondId] = [];
        }

        // Deduplicate: Check if project already exists in this bond's array
        $alreadyExists = false;
        foreach ($projectsByBond[$bondId] as $existingProject) {
            error_log(sprintf(
                "  Checking against existing: existing_id=%s, current_id=%s, match=%s",
                $existingProject['id'],
                $projectId,
                ($existingProject['id'] === $projectId ? 'YES' : 'NO')
            ));

            if ($existingProject['id'] === $projectId) {
                $alreadyExists = true;
                error_log("  DUPLICATE FOUND! Skipping this row.");
                $debugDedup[] = "Row $index (id=$projectId) SKIPPED - duplicate";
                break;
            }
        }

        if (!$alreadyExists) {
            $projectsByBond[$bondId][] = $project;
            $debugDedup[] = "Row $index (id=$projectId, name={$project['name']}) ADDED";
            error_log("  ADDED to bond $bondId");
        }
    }

    error_log("Deduplication summary: " . json_encode($debugDedup));

    // Attach projects to each bond
    foreach ($bonds as &$bond) {
        $bond['projects'] = $projectsByBond[$bond['id']] ?? [];
        error_log(sprintf(
            "Bond ID %s (%s) has %s projects",
            $bond['id'],
            $bond['name'],
            count($bond['projects'])
        ));
    }
    unset($bond); // Unset reference

    error_log("===== FINAL OUTPUT =====");
    error_log("Returning " . count($bonds) . " bonds");
    error_log("===== END DEBUG =====");

    // TEMPORARY: Add debug info to response
    foreach ($bonds as &$bond) {
        $bond['_debug'] = [
            'total_rows_from_db' => count($allBondProjects),
            'projects_count' => count($bond['projects']),
            'project_ids' => array_map(function($p) { return $p['id']; }, $bond['projects']),
            'raw_db_rows' => array_map(function($p) {
                return [
                    'id' => $p['id'],
                    'name' => $p['name'],
                    'bond_id' => $p['bond_id'],
                    'order_number' => $p['order_number']
                ];
            }, $allBondProjects),
            'deduplication_log' => $debugDedup
        ];
    }
    unset($bond); // Unset reference

    sendResponse($bonds);
}

// POST - Create new bond
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        sendError('Invalid JSON data');
    }

    try {
        $pdo->beginTransaction();

        // Insert bond
        $sql = "INSERT INTO bonds (
            name, total_value, total_budget, project_count, status,
            approval_date, start_year, end_year
        ) VALUES (
            :name, :total_value, :total_budget, :project_count, :status,
            :approval_date, :start_year, :end_year
        )";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':total_value' => $data['totalValue'] ?? 0,
            ':total_budget' => $data['totalBudget'] ?? 0,
            ':project_count' => $data['projectCount'] ?? 0,
            ':status' => $data['status'] ?? 'Planning',
            ':approval_date' => $data['approvalDate'] ?? '',
            ':start_year' => $data['startYear'] ?? null,
            ':end_year' => $data['endYear'] ?? null
        ]);

        $bondId = $pdo->lastInsertId();

        // Insert bond-project links if provided
        if (isset($data['projectIds']) && is_array($data['projectIds'])) {
            $linkSql = "INSERT INTO bond_projects (bond_id, project_id, order_number)
                        VALUES (:bond_id, :project_id, :order_number)";
            $linkStmt = $pdo->prepare($linkSql);

            foreach ($data['projectIds'] as $index => $projectId) {
                $linkStmt->execute([
                    ':bond_id' => $bondId,
                    ':project_id' => $projectId,
                    ':order_number' => $index + 1
                ]);
            }
        }

        $pdo->commit();

        sendResponse([
            'success' => true,
            'id' => $bondId,
            'message' => 'Bond created successfully'
        ], 201);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError('Failed to create bond: ' . $e->getMessage(), 500);
    }
}

// PUT - Update existing bond
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['id'])) {
        sendError('Invalid data or missing bond ID');
    }

    try {
        $pdo->beginTransaction();

        // Update bond
        $sql = "UPDATE bonds SET
            name = :name,
            total_value = :total_value,
            total_budget = :total_budget,
            project_count = :project_count,
            status = :status,
            approval_date = :approval_date,
            start_year = :start_year,
            end_year = :end_year
            WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => $data['id'],
            ':name' => $data['name'],
            ':total_value' => $data['totalValue'] ?? 0,
            ':total_budget' => $data['totalBudget'] ?? 0,
            ':project_count' => $data['projectCount'] ?? 0,
            ':status' => $data['status'] ?? 'Planning',
            ':approval_date' => $data['approvalDate'] ?? '',
            ':start_year' => $data['startYear'] ?? null,
            ':end_year' => $data['endYear'] ?? null
        ]);

        // Update bond-project links if provided
        if (isset($data['projectIds'])) {
            // Delete existing links
            $deleteStmt = $pdo->prepare("DELETE FROM bond_projects WHERE bond_id = ?");
            $deleteStmt->execute([$data['id']]);

            // Insert new links
            if (is_array($data['projectIds'])) {
                $linkSql = "INSERT INTO bond_projects (bond_id, project_id, order_number)
                            VALUES (:bond_id, :project_id, :order_number)";
                $linkStmt = $pdo->prepare($linkSql);

                foreach ($data['projectIds'] as $index => $projectId) {
                    $linkStmt->execute([
                        ':bond_id' => $data['id'],
                        ':project_id' => $projectId,
                        ':order_number' => $index + 1
                    ]);
                }
            }
        }

        $pdo->commit();

        sendResponse([
            'success' => true,
            'message' => 'Bond updated successfully'
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        sendError('Failed to update bond: ' . $e->getMessage(), 500);
    }
}

// DELETE - Delete bond
if ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        sendError('Bond ID required');
    }

    try {
        // Note: bond_projects will be deleted automatically due to CASCADE
        $stmt = $pdo->prepare("DELETE FROM bonds WHERE id = ?");
        $stmt->execute([$_GET['id']]);

        sendResponse([
            'success' => true,
            'message' => 'Bond deleted successfully'
        ]);

    } catch (Exception $e) {
        sendError('Failed to delete bond: ' . $e->getMessage(), 500);
    }
}

sendError('Invalid request method', 405);
?>
