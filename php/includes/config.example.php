<?php
// Copy to config.php and fill with InfinityFree MySQL credentials.
define('BASE_URL', '/php');
define('DB_HOST', 'YOUR_MYSQL_HOST');
define('DB_NAME', 'YOUR_DATABASE_NAME');
define('DB_USER', 'YOUR_DATABASE_USER');
define('DB_PASS', 'YOUR_DATABASE_PASSWORD');
session_set_cookie_params(['httponly'=>true,'samesite'=>'Lax','secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
