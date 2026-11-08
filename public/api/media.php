<?php
declare(strict_types=1);

const MAX_MEDIA_BYTES = 20 * 1024 * 1024;

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Media proxy is not configured.');
}

$config = require $configFile;
$baseUrl = rtrim((string) ($config['supabase_url'] ?? ''), '/');
$serviceKey = (string) ($config['supabase_service_role_key'] ?? '');
$path = rawurldecode((string) ($_GET['path'] ?? ''));

if (
    $baseUrl === '' ||
    $serviceKey === '' ||
    $path === '' ||
    str_contains($path, '..') ||
    !preg_match('/^[a-zA-Z0-9_\/.\-]+$/', $path)
) {
    http_response_code(404);
    exit;
}

$url = $baseUrl . '/storage/v1/object/authenticated/media/'
    . implode('/', array_map('rawurlencode', explode('/', $path)));
$responseHeaders = [];
$body = fopen('php://temp/maxmemory:' . MAX_MEDIA_BYTES, 'w+b');
$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_HTTPHEADER => [
        'apikey: ' . $serviceKey,
        'Authorization: Bearer ' . $serviceKey,
    ],
    CURLOPT_FILE => $body,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HEADERFUNCTION => static function ($curl, string $header) use (&$responseHeaders): int {
        $length = strlen($header);
        $parts = explode(':', $header, 2);
        if (count($parts) === 2) {
            $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
        }
        return $length;
    },
]);

$ok = curl_exec($curl);
$status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$contentType = (string) (curl_getinfo($curl, CURLINFO_CONTENT_TYPE) ?: 'application/octet-stream');
curl_close($curl);

if (!$ok || $status !== 200) {
    fclose($body);
    http_response_code($status === 404 ? 404 : 502);
    exit;
}

$size = ftell($body);
if ($size > MAX_MEDIA_BYTES) {
    fclose($body);
    http_response_code(413);
    exit;
}

rewind($body);
header('Content-Type: ' . $contentType);
header('Content-Length: ' . $size);
header('Cache-Control: public, max-age=31536000, immutable');
header('X-Content-Type-Options: nosniff');
fpassthru($body);
fclose($body);
