<?php
/**
 * Health Check Endpoint
 * Used by Docker healthcheck and monitoring
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$health = [
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'service' => '2Sweety Backend API',
    'version' => '1.0.0'
];

// Check database connection
try {
    require_once '../inc/Connection.php';

    if ($dating && $dating->ping()) {
        $health['database'] = 'connected';
    } else {
        $health['database'] = 'disconnected';
        $health['status'] = 'degraded';
    }
} catch (Exception $e) {
    $health['database'] = 'error';
    $health['status'] = 'unhealthy';
}

// HTTP status code
http_response_code($health['status'] === 'healthy' ? 200 : 503);

echo json_encode($health, JSON_PRETTY_PRINT);
?>
