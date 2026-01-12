<?php
/**
 * Database Configuration for Project Prism
 * Bluehost MySQL Connection
 */

// Session configuration - must be before session_start()
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_path', '/');
ini_set('session.cookie_lifetime', 0); // Session cookie (expires when browser closes)
ini_set('session.gc_maxlifetime', 28800); // 8 hours in seconds
ini_set('session.use_strict_mode', 1);
ini_set('session.name', 'PRISM_SESSION');

// Database credentials
// SECURITY: Move these to environment variables in production
define('DB_HOST', 'localhost');
define('DB_NAME', 'pflugera_projectprism_db');
define('DB_USER', 'pflugera_prism_user');
define('DB_PASS', 'modFyc-6qaxtu-fixnyv');
define('DB_CHARSET', 'utf8mb4');

// Session timeout (8 hours)
define('SESSION_TIMEOUT', 8 * 60 * 60);

/**
 * Set CORS headers for API responses
 */
function setCorsHeaders() {
    // Allowed origins
    $allowedOrigins = [
        'https://prism.pflugerarchitects.com',
        'http://localhost:3000',
        'http://localhost:5173'
    ];

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=UTF-8');

    // Security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
}

// Set CORS headers immediately
setCorsHeaders();

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Get database connection
 * @return PDO Database connection object
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed'
        ]);
        exit();
    }
}

/**
 * Require authentication for protected endpoints
 * Call this at the start of any endpoint that requires authentication
 */
function requireAuth() {
    session_start();

    // Check if user is logged in
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_time'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit();
    }

    // Check session timeout
    if (time() - $_SESSION['login_time'] > SESSION_TIMEOUT) {
        session_destroy();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Session expired']);
        exit();
    }

    // Update last activity timestamp
    $_SESSION['last_activity'] = time();

    return $_SESSION;
}

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['success' => false, 'error' => $message]);
    exit();
}
?>
