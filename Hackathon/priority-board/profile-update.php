<?php
require 'auth.php';
require 'db.php';
header('Content-Type: application/json');

$in = json_decode(file_get_contents('php://input'), true) ?: [];

$name   = substr(trim($in['display_name'] ?? ''), 0, 100);
$bio    = substr(trim($in['bio'] ?? ''), 0, 160);
$avatar = substr(trim($in['avatar'] ?? '🙂'), 0, 10);

$stmt = $pdo->prepare('UPDATE users SET display_name = ?, bio = ?, avatar = ? WHERE id = ?');
$stmt->execute([$name, $bio, $avatar, $_SESSION['user_id']]);

echo json_encode(['ok' => true]);