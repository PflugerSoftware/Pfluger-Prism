<?php
/**
 * Pods and Space Types API Endpoint
 * Handles CRUD operations for pods, space types, and pod spaces
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

// Determine which resource is being requested
$resource = $_GET['resource'] ?? 'pods'; // 'pods' or 'spaces'

// ============================================
// PODS ENDPOINTS
// ============================================
if ($resource === 'pods') {

    // GET - Fetch all pods with their spaces
    if ($method === 'GET') {

        if (isset($_GET['id'])) {
            // Get single pod
            $stmt = $pdo->prepare("SELECT * FROM pods WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $pod = $stmt->fetch();

            if (!$pod) {
                sendError('Pod not found', 404);
            }

            // Get pod spaces
            $stmt = $pdo->prepare("
                SELECT ps.*, st.name as space_name, st.cost_per_sf, st.icon
                FROM pod_spaces ps
                LEFT JOIN space_types st ON ps.space_type_id = st.id
                WHERE ps.pod_id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $pod['spaces'] = $stmt->fetchAll();

            sendResponse($pod);
        }

        // Get all pods
        $stmt = $pdo->query("SELECT * FROM pods WHERE is_active = 1 ORDER BY category, name");
        $pods = $stmt->fetchAll();

        // Get all pod spaces
        $stmt = $pdo->query("
            SELECT ps.*, st.name as space_name, st.cost_per_sf, st.icon
            FROM pod_spaces ps
            LEFT JOIN space_types st ON ps.space_type_id = st.id
        ");
        $allPodSpaces = $stmt->fetchAll();

        // Group spaces by pod_id
        $spacesByPod = [];
        foreach ($allPodSpaces as $space) {
            $spacesByPod[$space['pod_id']][] = $space;
        }

        // Attach spaces to each pod
        foreach ($pods as &$pod) {
            $pod['spaces'] = $spacesByPod[$pod['id']] ?? [];
        }

        sendResponse($pods);
    }

    // POST - Create new pod
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            sendError('Invalid JSON data');
        }

        try {
            $pdo->beginTransaction();

            // Insert pod
            $sql = "INSERT INTO pods (
                id, name, description, category, total_sf, estimated_cost,
                cost_range_low, cost_range_high, icon, building_types, is_active
            ) VALUES (
                :id, :name, :description, :category, :total_sf, :estimated_cost,
                :cost_range_low, :cost_range_high, :icon, :building_types, :is_active
            )";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':description' => $data['description'] ?? '',
                ':category' => $data['category'] ?? '',
                ':total_sf' => $data['totalSF'] ?? 0,
                ':estimated_cost' => $data['estimatedCost'] ?? 0,
                ':cost_range_low' => $data['costRangeLow'] ?? 0,
                ':cost_range_high' => $data['costRangeHigh'] ?? 0,
                ':icon' => $data['icon'] ?? '',
                ':building_types' => $data['buildingTypes'] ?? '',
                ':is_active' => $data['isActive'] ?? true
            ]);

            // Insert pod spaces if provided
            if (isset($data['spaces']) && is_array($data['spaces'])) {
                $spaceSql = "INSERT INTO pod_spaces (pod_id, space_type_id, quantity, square_footage, cost_override)
                             VALUES (:pod_id, :space_type_id, :quantity, :square_footage, :cost_override)";
                $spaceStmt = $pdo->prepare($spaceSql);

                foreach ($data['spaces'] as $space) {
                    $spaceStmt->execute([
                        ':pod_id' => $data['id'],
                        ':space_type_id' => $space['spaceTypeId'],
                        ':quantity' => $space['quantity'] ?? 1,
                        ':square_footage' => $space['squareFootage'] ?? 0,
                        ':cost_override' => $space['costOverride'] ?? null
                    ]);
                }
            }

            $pdo->commit();

            sendResponse([
                'success' => true,
                'id' => $data['id'],
                'message' => 'Pod created successfully'
            ], 201);

        } catch (Exception $e) {
            $pdo->rollBack();
            sendError('Failed to create pod: ' . $e->getMessage(), 500);
        }
    }

    // PUT - Update existing pod
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['id'])) {
            sendError('Invalid data or missing pod ID');
        }

        try {
            $pdo->beginTransaction();

            // Update pod
            $sql = "UPDATE pods SET
                name = :name,
                description = :description,
                category = :category,
                total_sf = :total_sf,
                estimated_cost = :estimated_cost,
                cost_range_low = :cost_range_low,
                cost_range_high = :cost_range_high,
                icon = :icon,
                building_types = :building_types,
                is_active = :is_active
                WHERE id = :id";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':description' => $data['description'] ?? '',
                ':category' => $data['category'] ?? '',
                ':total_sf' => $data['totalSF'] ?? 0,
                ':estimated_cost' => $data['estimatedCost'] ?? 0,
                ':cost_range_low' => $data['costRangeLow'] ?? 0,
                ':cost_range_high' => $data['costRangeHigh'] ?? 0,
                ':icon' => $data['icon'] ?? '',
                ':building_types' => $data['buildingTypes'] ?? '',
                ':is_active' => $data['isActive'] ?? true
            ]);

            // Update pod spaces if provided
            if (isset($data['spaces'])) {
                // Delete existing spaces
                $deleteStmt = $pdo->prepare("DELETE FROM pod_spaces WHERE pod_id = ?");
                $deleteStmt->execute([$data['id']]);

                // Insert new spaces
                if (is_array($data['spaces'])) {
                    $spaceSql = "INSERT INTO pod_spaces (pod_id, space_type_id, quantity, square_footage, cost_override)
                                 VALUES (:pod_id, :space_type_id, :quantity, :square_footage, :cost_override)";
                    $spaceStmt = $pdo->prepare($spaceSql);

                    foreach ($data['spaces'] as $space) {
                        $spaceStmt->execute([
                            ':pod_id' => $data['id'],
                            ':space_type_id' => $space['spaceTypeId'],
                            ':quantity' => $space['quantity'] ?? 1,
                            ':square_footage' => $space['squareFootage'] ?? 0,
                            ':cost_override' => $space['costOverride'] ?? null
                        ]);
                    }
                }
            }

            $pdo->commit();

            sendResponse([
                'success' => true,
                'message' => 'Pod updated successfully'
            ]);

        } catch (Exception $e) {
            $pdo->rollBack();
            sendError('Failed to update pod: ' . $e->getMessage(), 500);
        }
    }

    // DELETE - Delete pod
    if ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            sendError('Pod ID required');
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM pods WHERE id = ?");
            $stmt->execute([$_GET['id']]);

            sendResponse([
                'success' => true,
                'message' => 'Pod deleted successfully'
            ]);

        } catch (Exception $e) {
            sendError('Failed to delete pod: ' . $e->getMessage(), 500);
        }
    }
}

// ============================================
// SPACE TYPES ENDPOINTS
// ============================================
if ($resource === 'spaces') {

    // GET - Fetch all space types
    if ($method === 'GET') {

        if (isset($_GET['id'])) {
            // Get single space type
            $stmt = $pdo->prepare("SELECT * FROM space_types WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $space = $stmt->fetch();

            if (!$space) {
                sendError('Space type not found', 404);
            }

            sendResponse($space);
        }

        // Get all space types
        $stmt = $pdo->query("SELECT * FROM space_types WHERE is_active = 1 ORDER BY category, name");
        $spaces = $stmt->fetchAll();

        sendResponse($spaces);
    }

    // POST - Create new space type
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            sendError('Invalid JSON data');
        }

        try {
            $sql = "INSERT INTO space_types (
                id, name, category, cost_per_sf, icon, description,
                min_sf, max_sf, default_sf, is_active
            ) VALUES (
                :id, :name, :category, :cost_per_sf, :icon, :description,
                :min_sf, :max_sf, :default_sf, :is_active
            )";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':category' => $data['category'] ?? '',
                ':cost_per_sf' => $data['costPerSF'] ?? 0,
                ':icon' => $data['icon'] ?? '',
                ':description' => $data['description'] ?? '',
                ':min_sf' => $data['minSF'] ?? 0,
                ':max_sf' => $data['maxSF'] ?? 0,
                ':default_sf' => $data['defaultSF'] ?? 0,
                ':is_active' => $data['isActive'] ?? true
            ]);

            sendResponse([
                'success' => true,
                'id' => $data['id'],
                'message' => 'Space type created successfully'
            ], 201);

        } catch (Exception $e) {
            sendError('Failed to create space type: ' . $e->getMessage(), 500);
        }
    }

    // PUT - Update existing space type
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['id'])) {
            sendError('Invalid data or missing space type ID');
        }

        try {
            $sql = "UPDATE space_types SET
                name = :name,
                category = :category,
                cost_per_sf = :cost_per_sf,
                icon = :icon,
                description = :description,
                min_sf = :min_sf,
                max_sf = :max_sf,
                default_sf = :default_sf,
                is_active = :is_active
                WHERE id = :id";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':id' => $data['id'],
                ':name' => $data['name'],
                ':category' => $data['category'] ?? '',
                ':cost_per_sf' => $data['costPerSF'] ?? 0,
                ':icon' => $data['icon'] ?? '',
                ':description' => $data['description'] ?? '',
                ':min_sf' => $data['minSF'] ?? 0,
                ':max_sf' => $data['maxSF'] ?? 0,
                ':default_sf' => $data['defaultSF'] ?? 0,
                ':is_active' => $data['isActive'] ?? true
            ]);

            sendResponse([
                'success' => true,
                'message' => 'Space type updated successfully'
            ]);

        } catch (Exception $e) {
            sendError('Failed to update space type: ' . $e->getMessage(), 500);
        }
    }

    // DELETE - Delete space type
    if ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            sendError('Space type ID required');
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM space_types WHERE id = ?");
            $stmt->execute([$_GET['id']]);

            sendResponse([
                'success' => true,
                'message' => 'Space type deleted successfully'
            ]);

        } catch (Exception $e) {
            sendError('Failed to delete space type: ' . $e->getMessage(), 500);
        }
    }
}

sendError('Invalid resource or request method', 405);
?>
