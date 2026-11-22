<?php
session_start();
require 'db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $display = trim($_POST['display_name'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters.';
    } else {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $error = 'That email is already registered.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('INSERT INTO users (email, password, display_name) VALUES (?, ?, ?)');
            $stmt->execute([$email, $hash, $display]);
            $success = 'Account created. You can log in now.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign up · Priority</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700&family=Nunito+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="app.css">
  <style>
    .auth-wrap{max-width:420px;margin:60px auto;background:var(--surface);border-radius:28px;padding:32px;box-shadow:var(--shadow)}
    .auth-wrap h1{font-size:1.8rem;margin:0 0 6px}
    .auth-wrap p.sub{color:var(--muted);margin:0 0 22px}
    .auth-wrap label{display:grid;gap:6px;font-weight:700;font-size:.9rem;margin-bottom:14px}
    .auth-wrap input{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:11px 14px;width:100%;color:var(--text)}
    .auth-wrap .btn{width:100%;margin-top:6px}
    .msg{padding:10px 14px;border-radius:12px;margin-bottom:14px;font-weight:700;font-size:.9rem}
    .msg.err{background:hsl(0 85% 60% / .12);color:hsl(0 80% 50%)}
    .msg.ok{background:hsl(150 60% 45% / .12);color:hsl(150 55% 35%)}
    .auth-foot{margin-top:16px;text-align:center;color:var(--muted);font-size:.9rem}
    .auth-foot a{color:var(--accent);font-weight:700;text-decoration:none}
  </style>
</head>
<body>
<div class="auth-wrap">
  <h1>Create your account</h1>
  <p class="sub">Sign up to start using Priority.</p>

  <?php if ($error): ?><div class="msg err"><?= htmlspecialchars($error) ?></div><?php endif; ?>
  <?php if ($success): ?><div class="msg ok"><?= htmlspecialchars($success) ?></div><?php endif; ?>

  <form method="post">
    <label>Display name
      <input name="display_name" maxlength="100" placeholder="Your name">
    </label>
    <label>Email
      <input name="email" type="email" required placeholder="you@example.com">
    </label>
    <label>Password
      <input name="password" type="password" required minlength="6" placeholder="At least 6 characters">
    </label>
    <button class="btn btn-primary" type="submit">Create account</button>
  </form>

  <p class="auth-foot">Already have one? <a href="login.php">Log in</a></p>
</div>
</body>
</html>