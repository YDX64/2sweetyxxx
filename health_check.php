<?php
/**
 * 2Sweety Comprehensive Health Check
 * Upload this to /var/www/html/health_check.php
 * Access: https://api.2sweety.com/health_check.php
 */

header('Content-Type: application/json');

$health = [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => 'checking',
    'checks' => []
];

// 1. Database Check
try {
    $dbHost = getenv('DB_HOST') ?: 'localhost';
    $dbUser = getenv('DB_USER') ?: 'root';
    $dbPass = getenv('DB_PASSWORD') ?: '';
    $dbName = getenv('DB_NAME') ?: 'dating_db';
    $dbPort = (int)(getenv('DB_PORT') ?: 3306);

    $mysqli = new mysqli($dbHost, $dbUser, $dbPass, $dbName, $dbPort);

    if ($mysqli->connect_error) {
        $health['checks']['database'] = [
            'status' => 'error',
            'message' => 'Connection failed: ' . $mysqli->connect_error
        ];
    } else {
        $result = $mysqli->query("SELECT COUNT(*) as count FROM tbl_user");
        $row = $result->fetch_assoc();
        $health['checks']['database'] = [
            'status' => 'ok',
            'users' => $row['count'],
            'message' => 'Connected successfully'
        ];
    }
} catch (Exception $e) {
    $health['checks']['database'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

// 2. Redis Check
$health['checks']['redis'] = ['status' => 'not_configured'];
if (class_exists('Redis')) {
    try {
        $redis = new Redis();
        $redisHost = getenv('REDIS_HOST') ?: 'ms4wow8gwgwwko4g0wosc8c8';
        if ($redis->connect($redisHost, 6379, 2)) {
            $redis->set('health_check', time());
            $health['checks']['redis'] = [
                'status' => 'ok',
                'message' => 'Connected successfully'
            ];
        } else {
            $health['checks']['redis'] = [
                'status' => 'error',
                'message' => 'Connection failed'
            ];
        }
    } catch (Exception $e) {
        $health['checks']['redis'] = [
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
} else {
    $health['checks']['redis'] = [
        'status' => 'error',
        'message' => 'Redis extension not installed'
    ];
}

// 3. Firebase Check
$firebaseKey = getenv('FIREBASE_PRIVATE_KEY');
$firebaseEmail = getenv('FIREBASE_CLIENT_EMAIL');
$health['checks']['firebase'] = [
    'status' => ($firebaseKey != 'your_firebase_private_key' && $firebaseKey) ? 'configured' : 'not_configured',
    'has_key' => ($firebaseKey && $firebaseKey != 'your_firebase_private_key'),
    'has_email' => ($firebaseEmail && $firebaseEmail != 'your_firebase_client_email'),
    'message' => ($firebaseKey == 'your_firebase_private_key') ? 'Using placeholder values - Auth will not work' : 'Configured'
];

// 4. Agora Check
$agoraAppId = getenv('AGORA_APP_ID');
$agoraCert = getenv('AGORA_APP_CERTIFICATE');
$health['checks']['agora'] = [
    'status' => ($agoraAppId != 'your_agora_app_id' && $agoraAppId) ? 'configured' : 'not_configured',
    'has_app_id' => ($agoraAppId && $agoraAppId != 'your_agora_app_id'),
    'has_certificate' => ($agoraCert && $agoraCert != 'your_agora_certificate'),
    'message' => ($agoraAppId == 'your_agora_app_id') ? 'Using placeholder values - Video/Audio calls will not work' : 'Configured'
];

// 5. OneSignal Check
$oneSignalKey = getenv('ONESIGNAL_REST_API_KEY');
$oneSignalAppId = getenv('ONESIGNAL_APP_ID');
$health['checks']['onesignal'] = [
    'status' => ($oneSignalKey != 'your_onesignal_rest_key' && $oneSignalKey) ? 'configured' : 'not_configured',
    'has_api_key' => ($oneSignalKey && $oneSignalKey != 'your_onesignal_rest_key'),
    'has_app_id' => ($oneSignalAppId && $oneSignalAppId != ''),
    'app_id' => $oneSignalAppId,
    'message' => ($oneSignalKey == 'your_onesignal_rest_key') ? 'Using placeholder values - Push notifications will not work' : 'Configured'
];

// 6. Email/SMTP Check
$smtpHost = getenv('SMTP_HOST');
$smtpUser = getenv('SMTP_USER');
$health['checks']['email'] = [
    'status' => $smtpHost ? 'configured' : 'not_configured',
    'has_host' => (bool)$smtpHost,
    'has_user' => (bool)$smtpUser,
    'message' => $smtpHost ? 'SMTP configured' : 'No email configuration found - Emails will not be sent'
];

// 7. Payment Gateways Check
$payments = [];
if (getenv('RAZORPAY_KEY_ID') && getenv('RAZORPAY_KEY_ID') != 'your_razorpay_key') {
    $payments[] = 'Razorpay';
}
if (getenv('STRIPE_SECRET_KEY') && strpos(getenv('STRIPE_SECRET_KEY'), 'sk_') === 0) {
    $payments[] = 'Stripe';
}
if (getenv('PAYPAL_CLIENT_ID') && getenv('PAYPAL_CLIENT_ID') != 'your_paypal_client_id') {
    $payments[] = 'PayPal';
}

$health['checks']['payments'] = [
    'status' => count($payments) > 0 ? 'configured' : 'not_configured',
    'gateways' => $payments,
    'count' => count($payments),
    'message' => count($payments) > 0 ? 'Payment gateways configured' : 'No payment gateways configured - Payments will not work'
];

// 8. PHP Extensions Check
$requiredExtensions = ['curl', 'gd', 'mbstring', 'zip', 'mysqli', 'json'];
$optimalExtensions = ['redis', 'opcache', 'apcu', 'imagick'];
$installed = get_loaded_extensions();

$health['checks']['php_extensions'] = [
    'required' => array_map(function($ext) use ($installed) {
        return [
            'name' => $ext,
            'installed' => in_array($ext, $installed)
        ];
    }, $requiredExtensions),
    'optimal' => array_map(function($ext) use ($installed) {
        return [
            'name' => $ext,
            'installed' => in_array($ext, $installed)
        ];
    }, $optimalExtensions)
];

// 9. File Permissions Check
$writableDirs = [
    '/var/www/html/images',
    '/var/www/html/uploads',
    '/var/www/html/logs'
];

$health['checks']['file_permissions'] = [];
foreach ($writableDirs as $dir) {
    if (file_exists($dir)) {
        $health['checks']['file_permissions'][$dir] = is_writable($dir) ? 'writable' : 'not_writable';
    } else {
        $health['checks']['file_permissions'][$dir] = 'not_exists';
    }
}

// 10. Cron Jobs Check (would need to check last run times from database)
$health['checks']['cron_jobs'] = [
    'status' => 'unknown',
    'message' => 'Cron job status cannot be determined from this check'
];

// Calculate overall health
$criticalIssues = 0;
$warnings = 0;

// Critical issues that prevent app from working
if ($health['checks']['database']['status'] != 'ok') $criticalIssues++;
if ($health['checks']['firebase']['status'] != 'configured') $criticalIssues++;
if ($health['checks']['agora']['status'] != 'configured') $warnings++;
if ($health['checks']['onesignal']['status'] != 'configured') $warnings++;
if ($health['checks']['email']['status'] != 'configured') $warnings++;
if ($health['checks']['payments']['count'] == 0) $warnings++;

// Determine overall status
if ($criticalIssues > 0) {
    $health['status'] = 'critical';
    $health['message'] = "Critical issues found - App will not function properly";
} elseif ($warnings > 0) {
    $health['status'] = 'warning';
    $health['message'] = "Some features are not configured";
} else {
    $health['status'] = 'healthy';
    $health['message'] = "All systems operational";
}

$health['summary'] = [
    'critical_issues' => $criticalIssues,
    'warnings' => $warnings
];

// Output JSON
echo json_encode($health, JSON_PRETTY_PRINT);
?>