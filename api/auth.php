<?php
/**
 * Authentication API Endpoint
 * Handles user login, logout, and session verification
 *
 * Endpoints:
 *   GET  /auth.php - Check if authenticated
 *   POST /auth.php - Login or logout
 *     Login: { email, password }
 *     Logout: { action: 'logout' }
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Check authentication status
 */
if ($method === 'GET') {
    session_start();

    // Check if user is logged in
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['login_time'])) {
        sendResponse([
            'authenticated' => false
        ]);
    }

    // Check session timeout (8 hours)
    if (time() - $_SESSION['login_time'] > SESSION_TIMEOUT) {
        session_destroy();
        sendResponse([
            'authenticated' => false,
            'reason' => 'Session expired'
        ]);
    }

    // Session is valid - return user info
    sendResponse([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['email'],
            'firstName' => $_SESSION['first_name'],
            'lastName' => $_SESSION['last_name'],
            'role' => $_SESSION['role']
        ]
    ]);
}

/**
 * POST - Login or Logout
 */
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // Handle logout
    if (isset($data['action']) && $data['action'] === 'logout') {
        session_start();
        session_destroy();
        sendResponse([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    // Handle login
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        sendError('Email and password required', 400);
    }

    $email = trim($data['email']);
    $password = $data['password'];

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }

    // Validate password length
    if (strlen($password) < 1 || strlen($password) > 128) {
        sendError('Invalid password', 400);
    }

    try {
        $pdo = getDBConnection();

        // Get user by email (only active users)
        $stmt = $pdo->prepare("
            SELECT id, email, password_hash, first_name, last_name, role
            FROM users
            WHERE email = ? AND is_active = 1
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // Generic error to prevent user enumeration
            sendError('Invalid email or password', 401);
        }

        // Verify password using bcrypt
        if (!password_verify($password, $user['password_hash'])) {
            sendError('Invalid email or password', 401);
        }

        // Update last login timestamp
        $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $updateStmt->execute([$user['id']]);

        // Create session
        session_start();
        session_regenerate_id(true); // Prevent session fixation attacks

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();

        // Return success with user data (no password hash)
        sendResponse([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'role' => $user['role']
            ],
            'message' => 'Login successful'
        ]);

    } catch (Exception $e) {
        sendError('Authentication failed', 500);
    }
}

sendError('Invalid request method', 405);
?>
