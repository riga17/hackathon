<?php
session_start();
require 'db.php';

if (isset($_SESSION['user_id'])) {
    header('Location: home.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare('SELECT id, password FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $u = $stmt->fetch();

    if ($u && password_verify($password, $u['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $u['id'];
        $_SESSION['user_email'] = $email;
        header('Location: home.php');
        exit;
    } else {
        $error = 'Invalid email or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Log in · Priority</title>
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
    .auth-foot{margin-top:16px;text-align:center;color:var(--muted);font-size:.9rem}
    .auth-foot a{color:var(--accent);font-weight:700;text-decoration:none}
  </style>
</head>
<body>
<div class="auth-wrap">
  <h1>Welcome back</h1>
  <p class="sub">Log in to your Priority account.</p>

  <?php if ($error): ?><div class="msg err"><?= htmlspecialchars($error) ?></div><?php endif; ?>

  <form method="post">
    <label>Email
      <input name="email" type="email" required placeholder="you@example.com">
    </label>
    <label>Password
      <input name="password" type="password" required placeholder="Your password">
    </label>
    <button class="btn btn-primary" type="submit">Log in</button>
  </form>

  <p class="auth-foot">New here? <a href="register.php">Create an account</a></p>
</div>
</body>
</html>