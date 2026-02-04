<?php
/**
 * Web-accessible Liberty Hill Schools Import
 *
 * Access this via: https://prism.pflugerarchitects.com/api/import-liberty-hill.php
 *
 * This endpoint:
 * 1. Adds necessary columns to facilities table if needed
 * 2. Imports all Liberty Hill schools from JSON
 * 3. Returns results as JSON
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
require_once 'config.php';

try {
    $pdo = getDBConnection();
    $results = [];

    // Step 1: Check and add columns if needed
    $results['schema_update'] = [];

    // Check if columns exist
    $stmt = $pdo->query("SHOW COLUMNS FROM facilities LIKE 'grade_range'");
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        // Add new columns
        $sql = "ALTER TABLE facilities
                ADD COLUMN grade_range VARCHAR(20) AFTER capacity,
                ADD COLUMN principal VARCHAR(255) AFTER grade_range,
                ADD COLUMN phone VARCHAR(20) AFTER principal";

        $pdo->exec($sql);
        $results['schema_update']['status'] = 'Columns added successfully';
    } else {
        $results['schema_update']['status'] = 'Columns already exist';
    }

    // Step 2: Load JSON data
    // Try multiple possible paths for the JSON file
    $possiblePaths = [
        __DIR__ . '/../public/data/liberty_hill_schools.json',  // Local development
        __DIR__ . '/../data/liberty_hill_schools.json',         // Alternative path
        '/home2/pflugera/prism.pflugerarchitects.com/public/data/liberty_hill_schools.json',  // Bluehost absolute path
        '/home2/pflugera/prism.pflugerarchitects.com/data/liberty_hill_schools.json'          // Alternative Bluehost path
    ];

    $jsonFile = null;
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            $jsonFile = $path;
            break;
        }
    }

    if (!$jsonFile) {
        // If file still not found, try to fetch from the public URL
        $jsonUrl = 'https://prism.pflugerarchitects.com/data/liberty_hill_schools.json';
        $jsonContent = @file_get_contents($jsonUrl);

        if (!$jsonContent) {
            throw new Exception("JSON file not found. Tried paths: " . implode(', ', $possiblePaths) . " and URL: " . $jsonUrl);
        }

        // Use the content directly from URL
        $schools = json_decode($jsonContent, true);
    } else {
        $jsonContent = file_get_contents($jsonFile);
        $schools = json_decode($jsonContent, true);
    }

    if (!$schools) {
        throw new Exception("Failed to parse JSON file");
    }

    $results['schools_found'] = count($schools);

    // Step 3: Clear existing Liberty Hill data (preserve other facilities if any)
    $pdo->exec("DELETE FROM facilities WHERE
                name LIKE '%STEP%' OR
                name LIKE '%EL' OR
                name LIKE '%MIDDLE' OR
                name LIKE '%H S' OR
                name LIKE 'BAR W%' OR
                name LIKE 'BILL BURDEN%' OR
                name LIKE 'LIBERTY HILL%' OR
                name LIKE 'LOUINE NOBLE%' OR
                name LIKE 'RANCHO SIENNA%' OR
                name LIKE 'SANTA RITA%' OR
                name LIKE 'TIERRA ROSA%' OR
                name LIKE 'FUTURE%' OR
                name LIKE 'LEGACY RANCH%'");

    // Step 4: Import schools
    $successCount = 0;
    $errors = [];
    $importedSchools = [];

    // Prepare insert statement
    $stmt = $pdo->prepare("
        INSERT INTO facilities (
            name,
            facility_type,
            address,
            latitude,
            longitude,
            current_enrollment,
            status,
            grade_range,
            principal,
            phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($schools as $school) {
        try {
            // Map school type
            $typeMap = [
                'Elementary School' => 'Elementary',
                'Middle School' => 'Middle',
                'High School' => 'High School',
                'Elementary/Secondary' => 'Specialty'
            ];
            $facilityType = $typeMap[$school['school_type']] ?? 'District';

            // Determine status
            $status = 'Existing';
            if ($school['school_name'] === 'FUTURE H S' && $school['enrollment'] === 0) {
                $status = 'Planned';
            } elseif ($school['school_name'] === 'LEGACY RANCH H S' && $school['grade_range'] === "'09") {
                $status = 'Under Construction';
            }

            // Build address
            $address = trim($school['address']) . ', ' .
                      trim($school['city']) . ', ' .
                      trim($school['state']) . ' ' .
                      trim($school['zip']);

            // Clean grade range
            $gradeRange = ltrim($school['grade_range'], "'");

            // Execute insert
            $stmt->execute([
                trim($school['school_name']),
                $facilityType,
                $address,
                $school['coordinates']['latitude'],
                $school['coordinates']['longitude'],
                (int)$school['enrollment'],
                $status,
                $gradeRange,
                $school['principal'] ? trim($school['principal']) : null,
                trim($school['phone'])
            ]);

            $successCount++;
            $importedSchools[] = [
                'name' => $school['school_name'],
                'type' => $facilityType,
                'status' => $status,
                'enrollment' => $school['enrollment']
            ];

        } catch (Exception $e) {
            $errors[] = [
                'school' => $school['school_name'],
                'error' => $e->getMessage()
            ];
        }
    }

    // Step 5: Get summary statistics
    $stmt = $pdo->query("SELECT COUNT(*) FROM facilities");
    $totalFacilities = $stmt->fetchColumn();

    $stmt = $pdo->query("
        SELECT facility_type, COUNT(*) as count
        FROM facilities
        GROUP BY facility_type
    ");
    $typeDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->query("
        SELECT status, COUNT(*) as count
        FROM facilities
        GROUP BY status
    ");
    $statusDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepare response
    $response = [
        'success' => true,
        'message' => "Successfully imported $successCount schools",
        'results' => $results,
        'imported_count' => $successCount,
        'error_count' => count($errors),
        'errors' => $errors,
        'imported_schools' => $importedSchools,
        'summary' => [
            'total_facilities' => $totalFacilities,
            'type_distribution' => $typeDistribution,
            'status_distribution' => $statusDistribution
        ]
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>