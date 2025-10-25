<?php
/**
 * 2Sweety Database Connection - Production Version
 *
 * This file uses environment variables for database credentials
 * to keep sensitive information secure in production.
 *
 * For Coolify deployment, set these environment variables:
 * - DB_HOST (default: localhost)
 * - DB_PORT (default: 3306)
 * - DB_USER
 * - DB_PASSWORD
 * - DB_NAME
 */

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Language selection
if (isset($_SESSION["sel_lan"])) {
    $currentLang = $_SESSION["sel_lan"];
    include_once "languages/{$currentLang}.php";
}

// Database configuration from environment variables
$db_config = [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'port' => getenv('DB_PORT') ?: '3306',
    'user' => getenv('DB_USER') ?: 'dating_user',
    'password' => getenv('DB_PASSWORD') ?: '',
    'database' => getenv('DB_NAME') ?: 'dating_db',
    'charset' => 'utf8mb4'
];

// Validate required environment variables
if (empty($db_config['password'])) {
    error_log('ERROR: DB_PASSWORD environment variable is not set');
    if (!file_exists('/.dockerenv')) {
        // Only show error in non-Docker environments
        die('Database configuration error. Please check environment variables.');
    }
}

// Database connection with error handling
try {
    $dating = new mysqli(
        $db_config['host'],
        $db_config['user'],
        $db_config['password'],
        $db_config['database'],
        (int)$db_config['port']
    );

    // Check for connection errors
    if ($dating->connect_error) {
        throw new Exception("Connection failed: " . $dating->connect_error);
    }

    // Set character set
    if (!$dating->set_charset($db_config['charset'])) {
        throw new Exception("Error setting charset: " . $dating->error);
    }

    // Connection successful - log in production
    if (getenv('APP_ENV') === 'production') {
        error_log('Database connection established successfully');
    }

} catch (Exception $e) {
    // Log error
    error_log('Database Connection Error: ' . $e->getMessage());

    // In production, show generic error message
    if (getenv('APP_ENV') === 'production') {
        die('Unable to connect to database. Please contact administrator.');
    } else {
        // In development, show detailed error
        die('Database Connection Error: ' . $e->getMessage());
    }
}

// Verify connection is working
if (!$dating->ping()) {
    error_log('Database ping failed - connection may be lost');
}

// Load application settings
try {
    $prints = $dating->query("SELECT * FROM tbl_meet LIMIT 1");
    if ($prints === false) {
        throw new Exception("Failed to load tbl_meet: " . $dating->error);
    }
    $prints = $prints->fetch_assoc();

    $set_result = $dating->query("SELECT * FROM `tbl_setting` LIMIT 1");
    if ($set_result === false) {
        throw new Exception("Failed to load tbl_setting: " . $dating->error);
    }
    $set = $set_result->fetch_assoc();

    // Google Maps API key
    $apiKey = $set['map_key'] ?? getenv('GOOGLE_MAPS_API_KEY') ?? '';

} catch (Exception $e) {
    error_log('Settings Load Error: ' . $e->getMessage());
    // Initialize with defaults if settings can't be loaded
    $prints = [];
    $set = ['map_key' => ''];
    $apiKey = '';
}

// Staff/Manager permissions
if (isset($_SESSION["stype"]) && $_SESSION["stype"] == 'Staff') {
    try {
        $email = $dating->real_escape_string($_SESSION['datingname']);
        $sdata_result = $dating->query(
            "SELECT * FROM `tbl_manager` WHERE email='{$email}' LIMIT 1"
        );

        if ($sdata_result && $sdata_result->num_rows > 0) {
            $sdata = $sdata_result->fetch_assoc();

            // Parse permissions
            $interest_per = explode(',', $sdata['interest'] ?? '');
            $page_per = explode(',', $sdata['page'] ?? '');
            $faq_per = explode(',', $sdata['faq'] ?? '');
            $plist_per = explode(',', $sdata['plist'] ?? '');
            $language_per = explode(',', $sdata['language'] ?? '');
            $payout_per = explode(',', $sdata['payout'] ?? '');
            $religion_per = explode(',', $sdata['religion'] ?? '');
            $gift_per = explode(',', $sdata['gift'] ?? '');
            $rgoal_per = explode(',', $sdata['rgoal'] ?? '');
            $plan_per = explode(',', $sdata['plan'] ?? '');
            $package_per = explode(',', $sdata['package'] ?? '');
            $ulist_per = explode(',', $sdata['ulist'] ?? '');
            $fakeuser_per = explode(',', $sdata['fakeuser'] ?? '');
            $report_per = explode(',', $sdata['report'] ?? '');
            $notification_per = explode(',', $sdata['notification'] ?? '');
            $wallet_per = explode(',', $sdata['wallet'] ?? '');
            $coin_per = explode(',', $sdata['coin'] ?? '');
        } else {
            error_log('Staff user not found: ' . $_SESSION['datingname']);
        }
    } catch (Exception $e) {
        error_log('Staff Permissions Error: ' . $e->getMessage());
    }
}

// Cleanup function for proper connection closing
function close_database_connection() {
    global $dating;
    if ($dating && $dating->ping()) {
        $dating->close();
    }
}

// Register shutdown function to close connection
register_shutdown_function('close_database_connection');

?>
