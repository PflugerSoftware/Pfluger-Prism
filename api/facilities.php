<?php
/**
 * Facilities API Endpoint
 * Handles CRUD operations for facility records
 */

require_once 'config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($pdo);
        break;
    case 'POST':
        handlePost($pdo);
        break;
    case 'PUT':
        handlePut($pdo);
        break;
    case 'DELETE':
        handleDelete($pdo);
        break;
    default:
        sendError('Method not allowed', 405);
}

/**
 * GET - Fetch all facilities or a single facility by ID
 */
function handleGet($pdo) {
    try {
        // Check if requesting a single facility
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        if ($id) {
            // Fetch single facility with its projects
            $stmt = $pdo->prepare("
                SELECT * FROM facilities WHERE id = ?
            ");
            $stmt->execute([$id]);
            $facility = $stmt->fetch();

            if (!$facility) {
                sendError('Facility not found', 404);
            }

            // Fetch associated projects
            $projectStmt = $pdo->prepare("
                SELECT id, name, project_type, cost_estimate, status, square_footage
                FROM projects
                WHERE facility_id = ?
                ORDER BY start_date
            ");
            $projectStmt->execute([$id]);
            $facility['projects'] = $projectStmt->fetchAll();

            sendResponse($facility);
        } else {
            // Fetch all facilities
            $stmt = $pdo->query("
                SELECT
                    f.*,
                    COUNT(p.id) as project_count,
                    SUM(p.cost_estimate) as total_project_cost
                FROM facilities f
                LEFT JOIN projects p ON p.facility_id = f.id
                GROUP BY f.id
                ORDER BY f.name
            ");
            $facilities = $stmt->fetchAll();

            sendResponse($facilities);
        }
    } catch (PDOException $e) {
        sendError('Failed to fetch facilities: ' . $e->getMessage(), 500);
    }
}

/**
 * POST - Create a new facility
 */
function handlePost($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (empty($data['name']) || empty($data['facility_type'])) {
            sendError('Missing required fields: name, facility_type', 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO facilities (
                name,
                facility_type,
                address,
                latitude,
                longitude,
                site_area,
                year_built,
                current_enrollment,
                capacity,
                status,
                grade_range,
                principal,
                phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['name'],
            $data['facility_type'],
            $data['address'] ?? null,
            $data['latitude'] ?? null,
            $data['longitude'] ?? null,
            $data['site_area'] ?? null,
            $data['year_built'] ?? null,
            $data['current_enrollment'] ?? 0,
            $data['capacity'] ?? 0,
            $data['status'] ?? 'Planned',
            $data['grade_range'] ?? null,
            $data['principal'] ?? null,
            $data['phone'] ?? null
        ]);

        $facilityId = $pdo->lastInsertId();

        // Fetch and return the created facility
        $stmt = $pdo->prepare("SELECT * FROM facilities WHERE id = ?");
        $stmt->execute([$facilityId]);
        $facility = $stmt->fetch();

        sendResponse($facility, 201);
    } catch (PDOException $e) {
        sendError('Failed to create facility: ' . $e->getMessage(), 500);
    }
}

/**
 * PUT - Update an existing facility
 */
function handlePut($pdo) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['id'])) {
            sendError('Missing facility ID', 400);
        }

        $stmt = $pdo->prepare("
            UPDATE facilities SET
                name = ?,
                facility_type = ?,
                address = ?,
                latitude = ?,
                longitude = ?,
                site_area = ?,
                year_built = ?,
                current_enrollment = ?,
                capacity = ?,
                status = ?,
                grade_range = ?,
                principal = ?,
                phone = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ");

        $stmt->execute([
            $data['name'],
            $data['facility_type'],
            $data['address'] ?? null,
            $data['latitude'] ?? null,
            $data['longitude'] ?? null,
            $data['site_area'] ?? null,
            $data['year_built'] ?? null,
            $data['current_enrollment'] ?? 0,
            $data['capacity'] ?? 0,
            $data['status'] ?? 'Existing',
            $data['grade_range'] ?? null,
            $data['principal'] ?? null,
            $data['phone'] ?? null,
            $data['id']
        ]);

        if ($stmt->rowCount() === 0) {
            sendError('Facility not found', 404);
        }

        // Fetch and return updated facility
        $stmt = $pdo->prepare("SELECT * FROM facilities WHERE id = ?");
        $stmt->execute([$data['id']]);
        $facility = $stmt->fetch();

        sendResponse($facility);
    } catch (PDOException $e) {
        sendError('Failed to update facility: ' . $e->getMessage(), 500);
    }
}

/**
 * DELETE - Delete a facility (only if no projects are attached)
 */
function handleDelete($pdo) {
    try {
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;

        if (!$id) {
            sendError('Missing facility ID', 400);
        }

        // Check if facility has projects
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM projects WHERE facility_id = ?");
        $stmt->execute([$id]);
        $projectCount = $stmt->fetchColumn();

        if ($projectCount > 0) {
            sendError('Cannot delete facility with associated projects. Remove projects first.', 400);
        }

        // Delete facility
        $stmt = $pdo->prepare("DELETE FROM facilities WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            sendError('Facility not found', 404);
        }

        sendResponse(['message' => 'Facility deleted successfully']);
    } catch (PDOException $e) {
        sendError('Failed to delete facility: ' . $e->getMessage(), 500);
    }
}
?>
