<?php
require 'auth.php';
require 'db.php';
header('Content-Type: application/json');

$stmt = $pdo->prepare('SELECT email, display_name, avatar, bio, photo, created_at FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$u = $stmt->fetch();

if (!$u) {
    echo json_encode(['error' => 'not found']);
    exit;
}

echo json_encode([
    'email'        => $u['email'],
    'display_name' => $u['display_name'] ?: '',
    'avatar'       => $u['avatar'] ?: '🙂',
    'bio'          => $u['bio'] ?: '',
    'photo'        => $u['photo'] ?: '',
    'joined_at'    => $u['created_at'],
]);