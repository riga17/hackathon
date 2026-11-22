<?php
require 'auth.php';
require 'db.php';
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'), true) ?: [];

// Clear photo
if (!empty($in['clear'])) {
    $stmt = $pdo->prepare('UPDATE users SET photo = NULL WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    echo json_encode(['ok' => true, 'photo' => '']);
    exit;
}

$data = $in['photo'] ?? '';
if (!is_string($data) || strpos($data, 'data:image/') !== 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid image data.']);
    exit;
}

// Basic size guard: base64 inflates ~33%, so limit encoded length to ~5.5 MB for a ~4 MB image
if (strlen($data) > 5_500_000) {
    http_response_code(413);
    echo json_encode(['error' => 'Image too large. Use a smaller photo (max 4 MB).']);
    exit;
}

$stmt = $pdo->prepare('UPDATE users SET photo = ? WHERE id = ?');
$stmt->execute([$data, $_SESSION['user_id']]);

echo json_encode(['ok' => true, 'photo' => $data]);