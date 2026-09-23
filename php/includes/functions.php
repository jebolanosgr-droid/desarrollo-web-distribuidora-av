<?php
function e(?string $value): string { return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8'); }
function redirect(string $path): never { header('Location: '.BASE_URL.'/'.$path); exit; }
function flash(string $type, string $message): void { $_SESSION['flash'] = compact('type','message'); }
function consume_flash(): ?array { $value = $_SESSION['flash'] ?? null; unset($_SESSION['flash']); return $value; }
function safe_redirect(?string $target, string $fallback='index.php'): string { return in_array($target, ['reserva.php','dashboard.php','index.php'], true) ? $target : $fallback; }
